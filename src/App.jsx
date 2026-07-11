import { useState } from 'react'
import LoginPage from './LoginPage'
import LeadsTable from './LeadsTable'
import StatsPage from './StatsPage'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState('leads')

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setView('leads')
  }

  if (view === 'stats') {
    return <StatsPage onLogout={handleLogout} onViewLeads={() => setView('leads')} />
  }

  return <LeadsTable onLogout={handleLogout} onViewStats={() => setView('stats')} />
}

export default App
