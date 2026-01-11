import React, {useState, useRef} from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { simulateMatch, saveGame } from '../api/client'

function DriveDetails({events, step}){
  const current = events?.[step]
  return (
    <div>
      {events?.map((e, i)=>(
        <div key={i} style={{padding:8,marginBottom:8,background:i===step? 'linear-gradient(90deg,#112,#233)':'transparent',borderRadius:8}}>
          <strong>Q{e.quarter} — {e.score} — Momentum {e.momentum}</strong>
          <ul>
            {e.drive.plays.map((p,pi)=>(<li key={pi}>{p.desc}: {p.yards} yards ({p.type})</li>))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function Simulation(){
  const [running, setRunning] = useState(false)
  const [events, setEvents] = useState([])
  const [summary, setSummary] = useState(null)
  const [playStyle, setPlayStyle] = useState('balanced')
  const [step, setStep] = useState(0)
  const animRef = useRef(null)

  async function run(){
    setRunning(true)
    setEvents([])
    setStep(0)
    // Build a small playPlan: use selected style for all 4 drives
    const playPlan = [playStyle, playStyle, playStyle, playStyle]
    const res = await simulateMatch({homeId:1, awayId:2, playPlan})
    setSummary(res)
    const chart = res.events.map((e, i) => ({idx:i+1, momentum: e.momentum, score: e.score}))
    setEvents(chart.map((c,i)=>({idx:c.idx, momentum:c.momentum, label:c.score, raw:res.events[i]})))
    // start animation playback
    let i = 0
    animRef.current = setInterval(()=>{
      setStep(s => {
        const ns = s+1
        if(ns >= res.events.length){ clearInterval(animRef.current) }
        return Math.min(ns, res.events.length-1)
      })
      i++
      if(i>res.events.length) clearInterval(animRef.current)
    }, 900)
    setRunning(false)
  }

  function save(){
    if(!summary) return
    const token = localStorage.getItem('cfb_token')
    const payload = {name:`Sim ${new Date().toISOString()}`, data: summary}
    if(token) payload._token = token
    saveGame(payload).then(()=>alert('Saved'))
  }

  return (
    <section className="simulation">
      <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
        <div className="card">
          <label>Play Style: </label>
          <select value={playStyle} onChange={e=>setPlayStyle(e.target.value)}>
            <option value="balanced">Balanced</option>
            <option value="pass">Pass Heavy</option>
            <option value="run">Run Heavy</option>
            <option value="aggro">Aggressive</option>
          </select>
        </div>

        <button className="card" onClick={run} disabled={running}>{running? 'Simulating...':'Run Simulation'}</button>
        <button className="card" onClick={save} disabled={!summary}>Save Result</button>
        <div className="card">Summary: {summary ? `${summary.homeScore}-${summary.awayScore} (${summary.winner})` : '—'}</div>
      </div>

      <div style={{marginTop:12}} className="card">
        <h4>Win Probability / Momentum (animated)</h4>
        <div style={{height:220}}>
          <ResponsiveContainer>
            <LineChart data={events.slice(0, step+1)}>
              <XAxis dataKey="idx" />
              <YAxis domain={[0,100]} />
              <Tooltip />
              <Line dataKey="momentum" stroke="#ff6b6b" dot={{r:4}} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{marginTop:12}} className="card">
        <h4>Drive Visualizer</h4>
        <DriveDetails events={summary?.events || []} step={step} />
      </div>
    </section>
  )
}
