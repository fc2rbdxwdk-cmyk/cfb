import React, {useEffect, useState} from 'react'
import { fetchRecruits, addRecruit } from '../api/client'

export default function Recruiting(){
  const [recruits, setRecruits] = useState([])
  const [form, setForm] = useState({name:'', stars:3, position:'ATH', state:''})

  useEffect(()=>{ load() }, [])
  async function load(){
    const r = await fetchRecruits()
    // enrich recruits with random jersey/ovr/potential if missing
    const enriched = (r.recruits || []).map((x,i)=>({
      ...x,
      jersey: x.jersey || Math.floor(1+Math.random()*99),
      ovr: x.ovr || Math.floor(60 + (x.stars/5)*30 + Math.random()*6),
      potential: x.potential || Math.floor(ovr => 70 + Math.random()*20)
    }))
    setRecruits(enriched)
  }

  async function submit(e){
    e.preventDefault()
    await addRecruit(form)
    setForm({name:'', stars:3, position:'ATH', state:''})
    load()
  }

  return (
    <section className="recruiting">
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <div className="card" style={{flex:'1 1 320px'}}>
          <h3>Add Recruit</h3>
          <form onSubmit={submit}>
            <div style={{marginBottom:8}}>
              <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div style={{marginBottom:8}}>
              <select value={form.stars} onChange={e=>setForm({...form,stars:parseInt(e.target.value)})}>
                {[5,4,3,2,1].map(s=> <option key={s} value={s}>{s}★</option>)}
              </select>
              <input placeholder="Position" value={form.position} onChange={e=>setForm({...form,position:e.target.value})} style={{marginLeft:8}} />
            </div>
            <div style={{marginBottom:8}}>
              <input placeholder="State" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} />
            </div>
            <button type="submit">Add Recruit</button>
          </form>
        </div>

        <div className="card" style={{flex:'2 1 480px'}}>
          <h3>Recruit List</h3>
          <ul>
            {recruits.map(r => (
              <li key={r.id}>{r.name} — {r.stars}★ — {r.position} — {r.state}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
