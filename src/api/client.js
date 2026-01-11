const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export async function fetchTeams(){
  const res = await fetch(`${API_BASE}/api/teams`)
  return res.json()
}

export async function fetchPlayers(){
  const res = await fetch(`${API_BASE}/api/players`)
  return res.json()
}

export async function createTeam(payload){
  const res = await fetch(`${API_BASE}/api/teams`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}

export async function createPlayer(payload){
  const res = await fetch(`${API_BASE}/api/players`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}

export async function registerUser(username){
  const res = await fetch(`${API_BASE}/api/register`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({username})})
  return res.json()
}

export async function simulateMatch(opts){
  const res = await fetch(`${API_BASE}/api/simulate`, {
    method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(opts)
  })
  return res.json()
}

export async function fetchRecruits(){
  const res = await fetch(`${API_BASE}/api/recruits`)
  return res.json()
}

export async function fetchSaves(token){
  const headers = {}
  if(token) headers.authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/api/saves`, {headers})
  return res.json()
}

export async function fetchUser(token){
  const headers = {}
  if(token) headers.authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/api/user`, {headers})
  return res.json()
}

export async function fetchStandings(){
  const res = await fetch(`${API_BASE}/api/standings`)
  return res.json()
}


export async function saveGame(payload){
  const headers = {'content-type':'application/json'}
  if(payload && payload._token){
    headers['authorization'] = `Bearer ${payload._token}`
    delete payload._token
  }
  const res = await fetch(`${API_BASE}/api/save`, {method:'POST', headers, body: JSON.stringify(payload)})
  return res.json()
}

export async function addRecruit(payload){
  const res = await fetch(`${API_BASE}/api/recruits`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}

export async function fetchDepth(teamId){
  const res = await fetch(`${API_BASE}/api/teams/${teamId}/depth`)
  return res.json()
}

export async function fetchPlayersForTeam(teamId){
  const res = await fetch(`${API_BASE}/api/players?teamId=${teamId}`)
  return res.json()
}

export async function updateDepth(teamId, players){
  const res = await fetch(`${API_BASE}/api/teams/${teamId}/depth`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({players})})
  return res.json()
}

export async function proposeTrades(teamId){
  const res = await fetch(`${API_BASE}/api/trade/propose`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({teamId})})
  return res.json()
}

export async function acceptTrade(offer){
  const res = await fetch(`${API_BASE}/api/trade/accept`, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({offer})})
  return res.json()
}
