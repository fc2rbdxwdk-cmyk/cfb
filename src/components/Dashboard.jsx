import React from 'react'

function LiveTicker() {
  return <div className="card ticker">Live scores: No games right now — preseason mode</div>
}

function TeamOfWeek() {
  return (
    <div className="card spotlight">
      <h3>Team of the Week</h3>
      <div className="team-spot">The Wildcats — 4 wins streak</div>
    </div>
  )
}

function PlayerCarousel() {
  return (
    <div className="card carousel">
      <h3>Player Spotlight</h3>
      <div className="carousel-track">Player A — QB — 95 OVR</div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <section className="dashboard">
      <div className="dash-grid">
        <LiveTicker />
        <TeamOfWeek />
        <PlayerCarousel />
        <div className="card">Upcoming: Week 1 — 7 days</div>
        <div className="card">Injury Report: None</div>
        <div className="card">Recruiting Alerts: 12 prospects</div>
      </div>
    </section>
  )
}
