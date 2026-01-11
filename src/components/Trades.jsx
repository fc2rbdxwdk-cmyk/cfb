import React, {useState, useEffect} from 'react'
import { proposeTrades, acceptTrade, fetchTeams } from '../api/client'

export default function Trades(){
  const [offers, setOffers] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(()=>{
    // fetch teams and then proposals for selected team
    async function load(){
      try{
        const t = await fetchTeams()
        const teamList = t.teams || []
        setTeams(teamList)
        const tid = teamList[0] && teamList[0].id
        setSelectedTeam(tid)
        if(tid){
          const json = await proposeTrades(tid)
          if(json && json.offers) setOffers(json.offers)
        }
      }catch(e){
        console.error('trade propose failed', e)
      }
    }
    load()
  },[])

  async function accept(off){
    // basic validation
    if(!off || !off.give || !off.ask) return alert('Invalid offer')
    try{
      const res = await acceptTrade(off)
      if(res && res.ok){
        alert('Trade applied')
        setOffers(o=>o.filter(x=>x.id!==off.id))
      }else{
        alert('Trade failed: ' + (res && res.error ? res.error : 'unknown'))
      }
    }catch(e){
      console.error(e)
      alert('Trade request failed')
    }
  }

  async function refresh(){
    if(!selectedTeam) return
    try{
      const json = await proposeTrades(selectedTeam)
      if(json && json.offers) setOffers(json.offers)
    }catch(e){ console.error(e) }
  }
  function decline(off){ setOffers(o=>o.filter(x=>x.id!==off.id)) }

  function onTeamChange(e){
    const id = parseInt(e.target.value)
    setSelectedTeam(id)
    if(id){ proposeTrades(id).then(j=>{ if(j && j.offers) setOffers(j.offers) }) }
  }

  return (
    <section className="trades">
      <div className="card">
        <h3>Trade Proposals</h3>
        <div style={{marginBottom:8}}>
          <label style={{marginRight:8}}>Team:</label>
          <select value={selectedTeam||''} onChange={onTeamChange}>
            <option value="">-- pick team --</option>
            {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={refresh} style={{marginLeft:8}}>Refresh</button>
        </div>
        {offers.length===0 && <div>No proposals right now</div>}
        <ul>
          {offers.map(o=>(
            <li key={o.id} style={{marginBottom:8}}>
              <div><strong>{o.from}</strong> offers {o.give.map(g=>g.name).join(', ')} for {o.ask.map(a=>a.name).join(', ')} — fairness {o.fairness}%</div>
              <div style={{marginTop:6}}>
                <button onClick={()=>accept(o)}>Accept</button>
                <button onClick={()=>decline(o)} style={{marginLeft:8}}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
