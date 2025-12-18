import { Button } from '@/components/ui/8bit/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Swords, Play, Loader2 } from 'lucide-react'
import { createCombat } from '@/lib/combat'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isCreating, setIsCreating] = useState(false)

  const handleStartCombat = async () => {
    if (!user?.email || isCreating) return
    setIsCreating(true)
    try {
      const combatId = await createCombat(user.email)
      navigate({ to: '/combat/$id', params: { id: combatId } })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]">
              <span className="text-gray-300">D2D</span>{' '}
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Toolbelt
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            The toolbelt for Dungeons & Dragons
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            A collection of tools for Dungeons & Dragons
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={handleStartCombat} disabled={isCreating || !user} className="flex items-center gap-2">
              {isCreating ? <Loader2 size={20} className="animate-spin" /> : <Swords size={20} />}
              {isCreating ? 'Creating...' : 'Start Combat Tracker'}
            </Button>
            <Button asChild variant="outline">
              <Link to="/combat/demo" className="flex items-center gap-2">
                <Play size={20} />
                Try Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
