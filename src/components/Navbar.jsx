import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-left">
        <img src={logo} alt="logo" className="logo" />
        <h1 className="brand">CFB Sim Hub</h1>
      </div>
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/players">Players</NavLink>
        <NavLink to="/schedule">Schedule</NavLink>
        <NavLink to="/stats">Stats Hub</NavLink>
        <NavLink to="/recruiting">Recruiting</NavLink>
        <NavLink to="/standings">Standings</NavLink>
        <NavLink to="/simulation">Simulation</NavLink>
        <NavLink to="/icons">Icons</NavLink>
        <NavLink to="/login">Login</NavLink>
      </nav>
      <div className="nav-right">
        <button className="icon-btn">🔔<span className="badge">3</span></button>
        <button className="profile-btn">User</button>
      </div>
    </header>
  )
}
