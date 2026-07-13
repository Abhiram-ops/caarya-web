import { useState } from 'react'
import LoginPage from './LoginPage'
import LeadsTable from './LeadsTable'
import ShortlistedPage from './ShortlistedPage'
import StatsPage from './StatsPage'
import OpportunityDetail from './OpportunityDetail'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState('leads')
  const [detailOrigin, setDetailOrigin] = useState('leads')
  const [selectedLead, setSelectedLead] = useState(null)

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setView('leads')
    setSelectedLead(null)
  }

  const openDetail = (lead, origin) => {
    setSelectedLead(lead)
    setDetailOrigin(origin)
    setView('detail')
  }

  if (view === 'detail' && selectedLead) {
    return (
      <OpportunityDetail lead={selectedLead} onBack={() => setView(detailOrigin)} />
    )
  }

  if (view === 'stats') {
    return <StatsPage onLogout={handleLogout} onViewLeads={() => setView('leads')} />
  }

  if (view === 'shortlist') {
    return (
      <ShortlistedPage
        onLogout={handleLogout}
        onViewStats={() => setView('stats')}
        onBackToLeads={() => setView('leads')}
        onSelectLead={(lead) => openDetail(lead, 'shortlist')}
      />
    )
  }

  return (
    <LeadsTable
      onLogout={handleLogout}
      onViewStats={() => setView('stats')}
      onViewShortlist={() => setView('shortlist')}
      onSelectLead={(lead) => openDetail(lead, 'leads')}
    />
  )
}

export default App
