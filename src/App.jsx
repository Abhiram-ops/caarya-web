import { useState } from 'react'
import LoginPage from './LoginPage'
import LeadsTable from './LeadsTable'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  return <LeadsTable onLogout={() => setLoggedIn(false)} />
}

export default App
