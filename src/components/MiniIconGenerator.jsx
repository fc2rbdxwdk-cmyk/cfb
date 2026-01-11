import React from 'react'

function IconCard({label}){
  return <div className="icon-card card">{label}</div>
}

export default function MiniIconGenerator(){
  const types = ['Pixel', 'Silhouette', 'Helmet', 'Jersey', 'Emoji']
  return (
    <section className="icons">
      <h2>Mini Player Icons</h2>
      <div className="icon-grid">
        {types.map(t => <IconCard key={t} label={t} />)}
      </div>
      <div className="card">Color-coded rarity tiers and position poses</div>
    </section>
  )
}
