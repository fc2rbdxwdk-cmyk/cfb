import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import TeamPage from './components/TeamPage'
import PlayerPage from './components/PlayerPage'
import StatsHub from './components/StatsHub'
import Schedule from './components/Schedule'
import Recruiting from './components/Recruiting'
import Standings from './components/Standings'
import Login from './components/Login'
import Teams from './components/Teams'
import Players from './components/Players'
import SavedGames from './components/SavedGames'
import Trades from './components/Trades'
import Simulation from './components/Simulation'
import MiniIconGenerator from './components/MiniIconGenerator'
import './styles/components.css'

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teams/:id" element={<TeamPage />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/players/:id" element={<PlayerPage />} />
          <Route path="/players" element={<Players />} />
          <Route path="/stats" element={<StatsHub />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/recruiting" element={<Recruiting />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/saves" element={<SavedGames />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/icons" element={<MiniIconGenerator />} />
        </Routes>
      </main>
    </div>
  )
}
