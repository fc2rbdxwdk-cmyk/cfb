const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const DB_PATH = path.join(__dirname, 'cfb.db')
const db = new sqlite3.Database(DB_PATH)

function runAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if(err) return reject(err)
      resolve({lastID: this.lastID, changes: this.changes})
    })
  })
}

function allAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if(err) return reject(err)
      resolve(rows)
    })
  })
}

async function init(){
  db.serialize(async ()=>{
    await runAsync(`CREATE TABLE IF NOT EXISTS recruits (id INTEGER PRIMARY KEY, name TEXT, stars INTEGER, position TEXT, state TEXT)`)
    await runAsync(`CREATE TABLE IF NOT EXISTS standings (teamId INTEGER PRIMARY KEY, teamName TEXT, wins INTEGER, losses INTEGER, ties INTEGER)`)
    await runAsync(`CREATE TABLE IF NOT EXISTS saves (id INTEGER PRIMARY KEY, name TEXT, data TEXT, createdAt TEXT, userToken TEXT)`)
    await runAsync(`CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY, name TEXT, conference TEXT, color TEXT)`)
    await runAsync(`CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY, name TEXT, pos TEXT, ovr INTEGER, teamId INTEGER)`)
    await runAsync(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, token TEXT UNIQUE, balance INTEGER DEFAULT 1000)`)
    // ensure users have balance column
    try{
      const ucols = await allAsync("PRAGMA table_info('users')")
      const uname = ucols.map(c=>c.name)
      if(!uname.includes('balance')){
        await runAsync('ALTER TABLE users ADD COLUMN balance INTEGER DEFAULT 1000')
      }
    }catch(e){ }

    const rows = await allAsync('SELECT COUNT(*) as c FROM standings')
    if(rows && rows[0] && rows[0].c === 0){
      await runAsync('INSERT INTO standings(teamId, teamName, wins, losses, ties) VALUES (?, ?, ?, ?, ?)', [1, 'Wildcats', 0,0,0])
      await runAsync('INSERT INTO standings(teamId, teamName, wins, losses, ties) VALUES (?, ?, ?, ?, ?)', [2, 'Rangers', 0,0,0])
    }

    const r = await allAsync('SELECT COUNT(*) as c FROM recruits')
    if(r && r[0] && r[0].c === 0){
      await runAsync('INSERT INTO recruits(name, stars, position, state) VALUES (?, ?, ?, ?)', ['Ethan Cole', 4, 'QB', 'CA'])
      await runAsync('INSERT INTO recruits(name, stars, position, state) VALUES (?, ?, ?, ?)', ['Marcus Lee', 3, 'WR', 'TX'])
    }

    // Ensure saves table has userToken column (migration for older DB)
    try{
      const cols = await allAsync("PRAGMA table_info('saves')")
      const hasUserToken = cols.some(c=>c.name === 'userToken')
      if(!hasUserToken){
        await runAsync('ALTER TABLE saves ADD COLUMN userToken TEXT')
      }
    }catch(e){ /* ignore */ }

    const t = await allAsync('SELECT COUNT(*) as c FROM teams')
    if(t && t[0] && t[0].c === 0){
      await runAsync('INSERT INTO teams(name, conference, color) VALUES (?, ?, ?)', ['Wildcats','Central','#4f46e5'])
      await runAsync('INSERT INTO teams(name, conference, color) VALUES (?, ?, ?)', ['Rangers','West','#ff6b6b'])
    }

    const p = await allAsync('SELECT COUNT(*) as c FROM players')
    if(p && p[0] && p[0].c === 0){
      await runAsync('INSERT INTO players(name, pos, ovr, teamId) VALUES (?, ?, ?, ?)', ['John Doe','QB',88,1])
      await runAsync('INSERT INTO players(name, pos, ovr, teamId) VALUES (?, ?, ?, ?)', ['Mike Strong','RB',83,2])
    }
    // migrate players table to include jersey, potential, stats if missing
    try{
      const cols = await allAsync("PRAGMA table_info('players')")
      const names = cols.map(c=>c.name)
      if(!names.includes('jersey')) await runAsync('ALTER TABLE players ADD COLUMN jersey INTEGER')
      if(!names.includes('potential')) await runAsync('ALTER TABLE players ADD COLUMN potential INTEGER')
      if(!names.includes('stats')) await runAsync('ALTER TABLE players ADD COLUMN stats TEXT')
      if(!names.includes('starter')) await runAsync('ALTER TABLE players ADD COLUMN starter INTEGER DEFAULT 0')
      if(!names.includes('depthOrder')) await runAsync('ALTER TABLE players ADD COLUMN depthOrder INTEGER DEFAULT 0')
      // seed jersey/potential/stats for existing players
      const existing = await allAsync('SELECT id, name FROM players')
      for(const pl of existing){
        const jersey = Math.floor(1+Math.random()*99)
        const potential = Math.floor(60 + Math.random()*40)
        const stats = JSON.stringify({games:0, passing:0, rushing:0, receiving:0, tackles:0})
        await runAsync('UPDATE players SET jersey=?, potential=?, stats=? WHERE id=?', [jersey, potential, stats, pl.id])
      }
    }catch(e){ }
  })
}

async function getRecruits(){
  return allAsync('SELECT * FROM recruits ORDER BY stars DESC, name')
}

async function addRecruit({name, stars=3, position='ATH', state=''}){
  // allow extended recruit fields
  const jersey = Math.floor(1 + Math.random()*99)
  const ovr = Math.floor(60 + (stars/5)*30 + Math.random()*6)
  const potential = Math.floor(ovr + Math.random()*15)
  const stats = JSON.stringify({games:0, passing:0, rushing:0, receiving:0, tackles:0})
  const res = await runAsync('INSERT INTO recruits(name, stars, position, state) VALUES (?, ?, ?, ?)', [name, stars, position, state])
  // also insert to players table as unsigned prospect (teamId null)
  await runAsync('INSERT INTO players(name, pos, ovr, teamId, jersey, potential, stats) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, position, ovr, null, jersey, potential, stats])
  return {id: res.lastID}
}

async function getStandings(){
  return allAsync('SELECT * FROM standings ORDER BY wins DESC')
}

async function getTeams(){
  return allAsync('SELECT * FROM teams')
}

async function addTeam({name, conference='', color='#888'}){
  const res = await runAsync('INSERT INTO teams(name, conference, color) VALUES (?, ?, ?)', [name, conference, color])
  return {id: res.lastID}
}

async function getPlayers(){
  return allAsync('SELECT * FROM players')
}

async function getDepth(teamId){
  return allAsync('SELECT * FROM players WHERE teamId = ? ORDER BY starter DESC, depthOrder ASC, ovr DESC', [teamId])
}

async function updatePlayerDepth(playerId, starter=0, depthOrder=0){
  return runAsync('UPDATE players SET starter=?, depthOrder=? WHERE id=?', [starter?1:0, depthOrder, playerId])
}

function playerValue(p){
  const ovr = p.ovr || 60
  const pot = p.potential || 70
  return ovr * 1.0 + (pot - ovr) * 0.6
}

async function generateTradeOffers(teamId){
  // pick another random team and propose a variety of 1v1,1v2,2v1 offers
  const teams = await allAsync('SELECT id FROM teams WHERE id != ?', [teamId])
  if(teams.length === 0) return []
  const other = teams[Math.floor(Math.random()*teams.length)].id
  const ourPlayers = await allAsync('SELECT * FROM players WHERE teamId = ? ORDER BY ovr DESC', [teamId])
  const theirPlayers = await allAsync('SELECT * FROM players WHERE teamId = ? ORDER BY ovr DESC', [other])
  const offers = []
  const pick = (arr, n, start=0) => arr.slice(start, start+n)
  const maxOffers = Math.min(5, theirPlayers.length)
  for(let i=0;i<maxOffers;i++){
    // choose a random offer shape
    const shape = Math.random()
    let give = []
    let ask = []
    if(shape < 0.5){
      // 1-for-1
      give = pick(theirPlayers, 1, i)
      ask = pick(ourPlayers, 1, i % ourPlayers.length)
    }else if(shape < 0.8){
      // 1-for-2 (they give 1, we give 2)
      give = pick(theirPlayers, 1, i)
      ask = pick(ourPlayers, 2, i % Math.max(1, ourPlayers.length-1))
    }else{
      // 2-for-1 (they give 2, we give 1)
      give = pick(theirPlayers, 2, i)
      ask = pick(ourPlayers, 1, i % ourPlayers.length)
    }
    if(give.length===0 || ask.length===0) continue
    const giveVal = give.reduce((s,p)=>s+playerValue(p),0)
    const askVal = ask.reduce((s,p)=>s+playerValue(p),0)
    const fairness = Math.round((Math.min(giveVal, askVal) / Math.max(1, Math.max(giveVal, askVal))) * 100)
    offers.push({id: `${teamId}-${other}-${i}`, from: other, give, ask, fairness})
  }
  return offers
}

async function applyTrade(offer){
  // swap teamIds for players in give <-> ask
  const changes = []
  const fromTeam = offer.from
  const toTeamCandidates = offer.ask.map(a=>a.teamId || null)
  // simple swap: assign give players to ask[0].teamId and ask players to give[0].teamId
  const theirTeam = offer.from
  const ourTeam = offer.ask[0] && offer.ask[0].teamId
  if(!ourTeam) return {error:'invalid ask team'}
  for(const p of offer.give){
    await runAsync('UPDATE players SET teamId=? WHERE id=?', [ourTeam, p.id])
    changes.push(p.id)
  }
  for(const p of offer.ask){
    await runAsync('UPDATE players SET teamId=? WHERE id=?', [theirTeam, p.id])
    changes.push(p.id)
  }
  // return updated rosters for both teams
  const updatedTheir = await allAsync('SELECT * FROM players WHERE teamId = ?', [theirTeam])
  const updatedOur = await allAsync('SELECT * FROM players WHERE teamId = ?', [ourTeam])
  return {ok:true, changed:changes, their: updatedTheir, our: updatedOur}
}

async function addPlayer({name, pos='UNK', ovr=50, teamId=null}){
  const res = await runAsync('INSERT INTO players(name, pos, ovr, teamId) VALUES (?, ?, ?, ?)', [name, pos, ovr, teamId])
  return {id: res.lastID}
}

function genToken(){
  return Math.random().toString(36).slice(2,12)
}

async function createUser({username}){
  const token = genToken()
  const res = await runAsync('INSERT OR IGNORE INTO users(username, token) VALUES (?, ?)', [username, token])
  // If user existed, fetch token
  const rows = await allAsync('SELECT token FROM users WHERE username = ?', [username])
  return {token: rows[0] && rows[0].token}
}

async function getUserByToken(token){
  const rows = await allAsync('SELECT * FROM users WHERE token = ?', [token])
  return rows[0]
}

async function saveGame({name, data}){
  const createdAt = new Date().toISOString()
  // allow optional userToken
  const userToken = (data && data.userToken) || null
  const res = await runAsync('INSERT INTO saves(name, data, createdAt, userToken) VALUES (?, ?, ?, ?)', [name, JSON.stringify(data), createdAt, userToken])
  return {id: res.lastID}
}

async function listSaves(){
  return allAsync('SELECT id, name, createdAt FROM saves ORDER BY createdAt DESC')
}

module.exports = {
  init,
  getRecruits,
  addRecruit,
  getStandings,
  saveGame,
  listSaves,
  getTeams,
  addTeam,
  getPlayers,
  getDepth,
  updatePlayerDepth,
  generateTradeOffers,
  applyTrade,
  addPlayer,
  createUser,
  getUserByToken
}
