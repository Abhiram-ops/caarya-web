import { useState } from 'react'
import './LoginPage.css'

const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'caarya'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setError('')
      onLogin()
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Caarya</h1>
        <p className="subtitle">Sign in to continue</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Log In</button>
      </form>
    </div>
  )
}

export default LoginPage
