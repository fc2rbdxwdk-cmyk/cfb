import React, {useEffect, useState} from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { fetchTeams } from '../api/client'

export default function StatsHub(){
  const [teams, setTeams] = useState([])

  useEffect(()=>{
    fetchTeams().then(r => setTeams(r.teams || []))
  },[])

  const data = teams.map(t => ({name: t.name, rating: Math.floor(Math.random()*30+70)}))

  // radar sample for top team
  const radarData = [
    {subject:'Passing', A: Math.floor(Math.random()*40+60)},
    {subject:'Rushing', A: Math.floor(Math.random()*40+60)},
    {subject:'Defense', A: Math.floor(Math.random()*40+60)},
    {subject:'Special', A: Math.floor(Math.random()*40+60)},
    {subject:'Discipline', A: Math.floor(Math.random()*40+60)}
  ]

  const heatmap = Array.from({length:6}).map((_,r)=>Array.from({length:10}).map((__,c)=>Math.floor(Math.random()*100)))

  return (
    <section className="stats-hub">
      <div className="card">
        <h2>League Leaderboards</h2>
        <div>Leaders: Passing, Rushing, Tackles, EPA</div>
      </div>

      <div className="card" style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12}}>
        <div style={{height:260}}>
          <h3>Team Power Ratings</h3>
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rating" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4>Team Radar</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Team A" dataKey="A" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Play Heatmap (sample)</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:4}}>
          {heatmap.flatMap((row,ri)=>row.map((v,ci)=>{
            const hue = Math.floor((1 - v/100)*220)
            return <div key={`${ri}-${ci}`} title={`${v}%`} style={{height:18,background:`hsl(${hue} 70% 50%)`,borderRadius:4}} />
          }))}
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>Advanced Metrics: EPA, QBR, YAC, Pressure Rate (interactive)</div>
    </section>
  )
}
