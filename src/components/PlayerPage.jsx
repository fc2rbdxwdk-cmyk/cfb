import React from 'react'

function PlayerHeader() {
  return (
    <div className="card player-header">
      <div className="player-avatar">👤</div>
      <div>
        <h2>John Doe</h2>
        <div className="player-sub">QB • Senior • 6'2"</div>
      </div>
      <div className="player-rating">★ ★ ★ ★ ☆ (88)</div>
    </div>
  )
}

export default function PlayerPage() {
  return (
    <section className="player-page">
      <PlayerHeader />
      <div className="player-grid">
        <div className="card">Attributes & traits</div>
        <div className="card">Morale & fatigue meters</div>
        <div className="card">Injury status</div>
        <div className="card">Career stats</div>
        <div className="card">Game-by-game charts</div>
        <div className="card">Comparison tool</div>
      </div>
    </section>
  )
}
