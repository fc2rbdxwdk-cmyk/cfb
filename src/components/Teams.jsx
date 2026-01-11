import React, {useEffect, useState} from 'react'
import { fetchTeams, createTeam } from '../api/client'

export default function Teams(){
  const [teams, setTeams] = useState([])
  const [form, setForm] = useState({name:'', conference:'', color:'#888'})

  useEffect(()=>{ load() }, [])
  async function load(){
    const r = await fetchTeams()
    setTeams(r.teams || [])
  }

  async function submit(e){
    e.preventDefault()
    await createTeam(form)
    setForm({name:'', conference:'', color:'#888'})
    load()
  }

  return (
    <section className="teams" style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:12}}>
      <div className="card">
        <h3>Create Team</h3>
        <form onSubmit={submit}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input placeholder="Conference" value={form.conference} onChange={e=>setForm({...form,conference:e.target.value})} />
          <input placeholder="Color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} />
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h3>Teams</h3>
        <ul>
          {teams.map(t=>(<li key={t.id}><strong>{t.name}</strong> — {t.conference} <span style={{color:t.color}}>■</span></li>))}
        </ul>
      </div>
    </section>
  )
}
