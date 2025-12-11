import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex h-14 items-center justify-between">
        <Link to="/" className="text-lg font-bold text-brand-700">RescueLink</Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {isAuthed ? (
            <>
              <span className="text-sm text-gray-700">{user?.name} ({user?.role})</span>
              <button className="btn-ghost" onClick={() => { logout(); navigate('/login') }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
