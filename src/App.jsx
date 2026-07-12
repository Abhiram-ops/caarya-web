import { useState } from 'react'
import LoginPage from './LoginPage'
import LeadsTable from './LeadsTable'
import StatsPage from './StatsPage'
import OpportunityDetail from './OpportunityDetail'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState('leads')
  const [selectedLead, setSelectedLead] = useState(null)

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setView('leads')
    setSelectedLead(null)
  }

  if (view === 'detail' && selectedLead) {
    return (
      <OpportunityDetail lead={selectedLead} onBack={() => setView('leads')} />
    )
  }

  if (view === 'stats') {
    return <StatsPage onLogout={handleLogout} onViewLeads={() => setView('leads')} />
  }

  return (
    <LeadsTable
      onLogout={handleLogout}
      onViewStats={() => setView('stats')}
      onSelectLead={(lead) => {
        setSelectedLead(lead)
        setView('detail')
      }}
    />
  )
}

export default App
