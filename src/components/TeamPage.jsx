import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { fetchDepth, updateDepth } from '../api/client'

const STARTER_LIMITS = { QB:1, RB:2, WR:3, TE:1, OL:5, DL:4, LB:3, DB:4, K:1, P:1 }

export default function TeamPage() {
  const params = useParams()
  const teamId = parseInt(params.id) || 1
  const [depth, setDepth] = useState([])
  const [editing, setEditing] = useState(false)

  useEffect(()=>{ load() }, [teamId])

  async function load(){
    try{
      const json = await fetchDepth(teamId)
      if(json && json.depth) setDepth(json.depth)
    }catch(e){ console.error('load depth failed', e) }
  }

  function toggleStarter(p){
    setDepth(d=>d.map(x=> x.id===p.id ? {...x, starter: x.starter?0:1} : x))
  }

  function move(p, dir){
    // dir = -1 up, 1 down (change depthOrder)
    setDepth(d=>d.map(x=> x.id===p.id ? {...x, depthOrder:(x.depthOrder||0)+dir} : x))
  }

  function validate(){
    const byPos = {}
    for(const p of depth){
      const pos = (p.pos||'UNK').toUpperCase()
      if(!byPos[pos]) byPos[pos]=[]
      if(p.starter) byPos[pos].push(p)
    }
    const errors = []
    for(const pos in byPos){
      const allowed = STARTER_LIMITS[pos] || 1
      if(byPos[pos].length > allowed) errors.push(`${pos} starters: ${byPos[pos].length} > ${allowed}`)
    }
    // ensure depthOrder uniqueness per position
    const orders = {}
    for(const p of depth){
      const key = p.pos||'UNK'
      orders[key] = orders[key] || {}
      const ord = p.depthOrder || 0
      if(orders[key][ord]) errors.push(`Duplicate depth order ${ord} for ${key}`)
      orders[key][ord] = true
    }
    return errors
  }

  async function save(){
    const errs = validate()
    if(errs.length){ return alert('Validation errors:\n' + errs.join('\n')) }
    const payload = depth.map(p=>({playerId:p.id, starter:p.starter?1:0, depthOrder:p.depthOrder||0}))
    try{
      const res = await updateDepth(teamId, payload)
      if(res && res.depth) setDepth(res.depth)
      setEditing(false)
      alert('Depth saved')
    }catch(e){ console.error('save depth failed', e); alert('Save failed') }
  }

  return (
    <section className="team-page">
      <div className="team-header card">
        <div className="team-banner">
          <h2>Team</h2>
          <div className="team-meta">Depth Chart</div>
        </div>
      </div>
      <div className="team-grid">
        <div className="card">
          <h4>Depth Chart</h4>
          <div style={{marginBottom:8}}>
            <button onClick={()=>setEditing(e=>!e)}>{editing? 'Cancel' : 'Edit Depth'}</button>
            {editing && <button onClick={save} style={{marginLeft:8}}>Save Depth</button>}
          </div>
          {depth.length===0 && <div>Loading...</div>}
          <div>
            {depth.map(p=> (
              <div key={p.id} style={{display:'flex',alignItems:'center', marginBottom:6}}>
                <div style={{width:220}}><strong>{p.name}</strong> — {p.pos} (OVR {p.ovr})</div>
                <div style={{width:90}}>J#{p.jersey||'-'}</div>
                <div style={{width:120}}>Starter: {p.starter? 'Yes':'No'}</div>
                <div style={{display:'flex',alignItems:'center'}}>
                  {editing && <>
                    <button onClick={()=>toggleStarter(p)}>Toggle Starter</button>
                    <button onClick={()=>move(p,-1)} style={{marginLeft:6}}>Up</button>
                    <button onClick={()=>move(p,1)} style={{marginLeft:6}}>Down</button>
                  </>}
                </div>
                <div style={{marginLeft:12}}>Depth: {p.depthOrder||0}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">Roster grid (mini icons)</div>
        <div className="card">Coaching staff cards</div>
        <div className="card">Team stats dashboard</div>
      </div>
    </section>
  )
}
