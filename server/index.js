const express = require('express')
const cors = require('cors')
const { runSimulation } = require('./simulator')
const db = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

// Use DB-backed teams/players
app.get('/api/teams', async (req, res) => {
  try{
    const t = await db.getTeams()
    res.json({ teams: t })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.post('/api/teams', async (req, res) => {
  try{
    const t = await db.addTeam(req.body)
    res.json(t)
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.get('/api/players', async (req, res) => {
  try{
    const teamId = req.query.teamId ? parseInt(req.query.teamId) : null
    if(teamId){
      const p = await db.getDepth(teamId)
      return res.json({ players: p })
    }
    const p = await db.getPlayers()
    res.json({ players: p })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.post('/api/players', async (req, res) => {
  try{
    const p = await db.addPlayer(req.body)
    res.json(p)
  }catch(err){ res.status(500).json({error:err.message}) }
})

// Recruiting, standings and saves backed by SQLite
app.get('/api/recruits', async (req, res) => {
  try{
    const recruits = await db.getRecruits()
    res.json({ recruits })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.post('/api/recruits', async (req, res) => {
  try{
    const id = await db.addRecruit(req.body)
    res.json(id)
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.get('/api/standings', async (req, res) => {
  try{
    const s = await db.getStandings()
    res.json({ standings: s })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.get('/api/saves', async (req, res) => {
  try{
    const saves = await db.listSaves()
    res.json({ saves })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.post('/api/save', async (req, res) => {
  try{
    // require valid token to save
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if(!token) return res.status(401).json({error:'Authorization required'})
    const user = await db.getUserByToken(token)
    if(!user) return res.status(401).json({error:'Invalid token'})
    const payload = req.body || {}
    payload.userToken = token
    const result = await db.saveGame(payload)
    res.json(result)
  }catch(err){ res.status(500).json({error:err.message}) }
})

// returns saves for authenticated user
app.get('/api/saves', async (req, res) => {
  try{
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if(!token) return res.status(401).json({error:'Authorization required'})
    const user = await db.getUserByToken(token)
    if(!user) return res.status(401).json({error:'Invalid token'})
    const all = await db.listSaves()
    const filtered = all.filter(s => s.userToken === token || !s.userToken)
    res.json({saves: filtered})
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.get('/api/user', async (req, res) => {
  try{
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if(!token) return res.status(401).json({error:'Authorization required'})
    const user = await db.getUserByToken(token)
    if(!user) return res.status(401).json({error:'Invalid token'})
    res.json({user:{username:user.username, balance:user.balance, token:user.token}})
  }catch(err){ res.status(500).json({error:err.message}) }
})

// simple user registration for token-based saves
app.post('/api/register', async (req, res) => {
  try{
    const {username} = req.body || {}
    if(!username) return res.status(400).json({error:'username required'})
    const user = await db.createUser({username})
    res.json(user)
  }catch(err){ res.status(500).json({error:err.message}) }
})

// Run simulation server-side (simple deterministic/randomized example)
app.post('/api/simulate', (req, res) => {
  const { homeId = 1, awayId = 2, playPlan = null } = req.body || {}
  const result = runSimulation({ homeId, awayId, playPlan })
  res.json(result)
})

// Depth chart endpoints
app.get('/api/teams/:id/depth', async (req, res) => {
  try{
    const teamId = parseInt(req.params.id)
    const depth = await db.getDepth(teamId)
    res.json({ depth })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.post('/api/teams/:id/depth', async (req, res) => {
  try{
    const teamId = parseInt(req.params.id)
    const updates = req.body && req.body.players ? req.body.players : []
    for(const u of updates){
      await db.updatePlayerDepth(u.playerId, u.starter, u.depthOrder)
    }
    const depth = await db.getDepth(teamId)
    res.json({ depth })
  }catch(err){ res.status(500).json({error:err.message}) }
})

// Trade endpoints
app.post('/api/trade/propose', async (req, res) => {
  try{
    const { teamId } = req.body || {}
    if(!teamId) return res.status(400).json({error:'teamId required'})
    const offers = await db.generateTradeOffers(teamId)
    res.json({ offers })
  }catch(err){ res.status(500).json({error:err.message}) }
})

app.post('/api/trade/accept', async (req, res) => {
  try{
    const offer = req.body && req.body.offer
    if(!offer) return res.status(400).json({error:'offer required'})
    const result = await db.applyTrade(offer)
    res.json(result)
  }catch(err){ res.status(500).json({error:err.message}) }
})

db.init().then(()=>{
  app.listen(PORT, () => console.log(`CFB server running on http://localhost:${PORT}`))
}).catch(err=>{
  console.error('DB init failed', err)
  process.exit(1)
})
