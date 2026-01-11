import React, {useState,useEffect} from 'react'
import { registerUser, fetchUser } from '../api/client'

export default function Login(){
  const [username, setUsername] = useState('')
  const [token, setToken] = useState(localStorage.getItem('cfb_token') || '')
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('real')

  useEffect(()=>{ if(token) loadUser(token) }, [token])

  async function loadUser(t){
    const res = await fetchUser(t)
    if(res && res.user) setUser(res.user)
  }

  async function submit(e){
    e && e.preventDefault()
    if(!username) return alert('Enter username')
    const res = await registerUser(username)
    if(res && res.token){
      localStorage.setItem('cfb_token', res.token)
      setToken(res.token)
      setUser({username, balance: 1000, token: res.token})
    }else{
      alert('Registration failed')
    }
  }

  function logout(){
    localStorage.removeItem('cfb_token')
    setToken('')
    setUser(null)
  }

  return (
    <section className="login card" style={{display:'grid',gap:12}}>
      <h3>Login / Register</h3>
      <div style={{display:'flex',gap:8}}>
        <label><input type="radio" checked={mode==='real'} onChange={()=>setMode('real')} /> Use real college league</label>
        <label><input type="radio" checked={mode==='custom'} onChange={()=>setMode('custom')} /> Create custom league</label>
      </div>

      {user ? (
        <div>
          <div style={{fontWeight:700}}>{user.username}</div>
          <div>Balance: ${user.balance ?? 1000}</div>
          <div>Token: <code style={{wordBreak:'break-all'}}>{user.token}</code></div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{display:'flex',gap:8}}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} style={{padding:8,borderRadius:8}} />
          <button type="submit">Register / Login</button>
        </form>
      )}
    </section>
  )
}
