import React, {useEffect, useState} from 'react'
import { fetchSaves } from '../api/client'

export default function SavedGames(){
  const [saves, setSaves] = useState([])

  useEffect(()=>{
    const token = localStorage.getItem('cfb_token')
    if(token) load(token)
  }, [])

  async function load(token){
    const res = await fetchSaves(token)
    setSaves(res.saves || [])
  }

  return (
    <section className="saved-games">
      <div className="card">
        <h3>Your Saves</h3>
        <ul>
          {saves.map(s=>(<li key={s.id}>{s.name} — {s.createdAt}</li>))}
        </ul>
      </div>
    </section>
  )
}
