import React, {useEffect, useState} from 'react'
import { fetchPlayers, createPlayer, fetchTeams } from '../api/client'

export default function Players(){
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [form, setForm] = useState({name:'', pos:'', ovr:70, teamId:''})

  useEffect(()=>{ load() }, [])
  async function load(){
    const p = await fetchPlayers()
    setPlayers(p.players || [])
    const t = await fetchTeams()
    setTeams(t.teams || [])
  }

  async function submit(e){
    e.preventDefault()
    await createPlayer({...form, teamId: form.teamId || null})
    setForm({name:'', pos:'', ovr:70, teamId:''})
    load()
  }

  return (
    <section className="players" style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:12}}>
      <div className="card">
        <h3>Create Player</h3>
        <form onSubmit={submit}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input placeholder="Position" value={form.pos} onChange={e=>setForm({...form,pos:e.target.value})} />
          <input type="number" placeholder="OVR" value={form.ovr} onChange={e=>setForm({...form,ovr:parseInt(e.target.value)})} />
          <select value={form.teamId} onChange={e=>setForm({...form,teamId:e.target.value})}>
            <option value="">Unassigned</option>
            {teams.map(t=>(<option value={t.id} key={t.id}>{t.name}</option>))}
          </select>
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h3>Players</h3>
        <ul>
          {players.map(p=>(<li key={p.id}>{p.name} — {p.pos} — {p.ovr} — Team {p.teamId || '—'}</li>))}
        </ul>
      </div>
    </section>
  )
}
