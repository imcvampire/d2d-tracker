import { Link, useNavigate } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Home,
  LogIn,
  LogOut,
  Menu,
  Swords,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/8bit/button'
import { v7 as uuidv7 } from 'uuid'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const navigate = useNavigate()

  const handleStartCombat = () => {
    const combatId = uuidv7()
    setIsOpen(false)
    navigate({ to: '/combat/$id', params: { id: combatId } })
  }

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">
              Home
            </Link>
          </h1>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-amber-400"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                    <User size={16} className="text-gray-900" />
                  </div>
                )}
                <span className="text-sm text-gray-300 max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={signInWithGoogle}
              size="sm"
              className="flex items-center gap-2"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login with Google</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <button
            onClick={handleStartCombat}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2 w-full text-left"
          >
            <Swords size={20} />
            <span className="font-medium">New Combat Session</span>
          </button>
        </nav>
      </aside>
    </>
  )
}
