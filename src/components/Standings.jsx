import React, {useEffect, useState} from 'react'
import { fetchStandings } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Standings(){
  const [standings, setStandings] = useState([])

  useEffect(()=>{ fetchStandings().then(r=>setStandings(r.standings||[])) }, [])

  const data = standings.map(s=>({name:s.teamName, wins:s.wins}))

  return (
    <section className="standings">
      <div className="card" style={{height:320}}>
        <h3>Conference Standings</h3>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="wins" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Table</h4>
        <table style={{width:'100%'}}>
          <thead><tr><th>Team</th><th>W</th><th>L</th><th>T</th></tr></thead>
          <tbody>
            {standings.map(s=>(<tr key={s.teamId}><td>{s.teamName}</td><td>{s.wins}</td><td>{s.losses}</td><td>{s.ties}</td></tr>))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
