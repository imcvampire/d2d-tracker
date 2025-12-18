import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Swords, Shield, Plus, Crown, Users, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/8bit/button'
import { Badge } from '@/components/ui/8bit/badge'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, query, where, or, Query } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import { createCombat } from '@/lib/combat'

export const Route = createFileRoute('/combat/')({ component: ProtectedCombatList })

function ProtectedCombatList() {
    return (
        <AuthGuard>
            <CombatList />
        </AuthGuard>
    )
}

interface CombatState {
    id?: string
    entities: Array<{
        id: string
        name: string
        health: number
        maxHealth: number
        initiative: number
        statuses: string[]
    }>
    currentTurnIndex: number
    currentRound: number
    dungeonMaster: string
    players: string[]
    createdAt: number
    updatedAt: number
}

function CombatList() {
    const { user } = useAuth()
    const navigate = useNavigate()

    // Query combats where user is DM or player
    const combatsRef = useMemo(() => {
        if (!user?.email) return null
        return query(
            collection(db, 'combats'),
            or(
                where('dungeonMaster', '==', user.email),
                where('players', 'array-contains', user.email)
            )
        ) as Query<CombatState>
    }, [user?.email])

    const [snapshot, loading] = useCollection(combatsRef)
    const [isCreating, setIsCreating] = useState(false)
    const combats = useMemo(() => {
        if (!snapshot) return []
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }))
    }, [snapshot])

    const handleStartNewCombat = async () => {
        if (!user?.email || isCreating) return
        setIsCreating(true)
        try {
            const combatId = await createCombat(user.email)
            navigate({ to: '/combat/$id', params: { id: combatId } })
        } finally {
            setIsCreating(false)
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getCombatName = (combat: CombatState) => {
        if (combat.entities.length === 0) return 'Empty Combat'
        const aliveEntities = combat.entities.filter(e => e.health > 0)
        if (aliveEntities.length === 0) return 'Combat (All Dead)'
        return combat.entities.slice(0, 3).map(e => e.name).join(', ') +
            (combat.entities.length > 3 ? ` +${combat.entities.length - 3} more` : '')
    }

    // Sort combats by updatedAt, most recent first
    const sortedCombats = useMemo(() => {
        if (!combats) return []
        return [...combats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    }, [combats])

    // Separate into DM combats and player combats
    const dmCombats = sortedCombats.filter(c => c.dungeonMaster === user?.email)
    const playerCombats = sortedCombats.filter(c => c.dungeonMaster !== user?.email && c.players?.includes(user?.email || ''))

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
                    <p className="text-amber-200/70 text-sm tracking-widest uppercase">Loading Combats...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-900">
            {/* Header */}
            <div className="relative py-6 sm:py-8 px-4 sm:px-6 text-center overflow-hidden border-b-4 border-amber-500/50">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBWNDBIMHoiLz48cGF0aCBkPSJNMjAgMjBoMnYyaC0yem0tMTAgMGgydjJoLTJ6bTIwIDBoMnYyaC0yeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
                        <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight retro">
                            <span className="text-amber-400">My Combats</span>
                        </h1>
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                    </div>
                    <p className="text-amber-200/70 text-xs sm:text-sm tracking-widest uppercase">
                        Manage Your Combat Sessions
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-3 sm:p-6">
                {/* New Combat Button */}
                <div className="mb-6">
                    <Button onClick={handleStartNewCombat} disabled={isCreating} className="w-full sm:w-auto">
                        {isCreating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        {isCreating ? 'Creating...' : 'Start New Combat'}
                    </Button>
                </div>

                {/* DM Combats Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-bold text-white retro">As Dungeon Master</h2>
                        <Badge variant="outline">{dmCombats.length}</Badge>
                    </div>

                    {dmCombats.length === 0 ? (
                        <div className="bg-slate-800/50 border-2 border-slate-600 p-6 text-center">
                            <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">You haven't created any combats yet.</p>
                            <p className="text-gray-500 text-sm">Click "Start New Combat" to begin!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dmCombats.map((combat) => (
                                <CombatCard
                                    key={combat.id}
                                    combat={combat}
                                    role="dm"
                                    getCombatName={getCombatName}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Player Combats Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white retro">As Player</h2>
                        <Badge variant="outline">{playerCombats.length}</Badge>
                    </div>

                    {playerCombats.length === 0 ? (
                        <div className="bg-slate-800/50 border-2 border-slate-600 p-6 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">You haven't been added to any combats yet.</p>
                            <p className="text-gray-500 text-sm">Ask your DM to add your email to a combat session.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {playerCombats.map((combat) => (
                                <CombatCard
                                    key={combat.id}
                                    combat={combat}
                                    role="player"
                                    getCombatName={getCombatName}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface CombatCardProps {
    combat: CombatState
    role: 'dm' | 'player'
    getCombatName: (combat: CombatState) => string
    formatDate: (timestamp: number) => string
}

function CombatCard({ combat, role, getCombatName, formatDate }: CombatCardProps) {
    const aliveCount = combat.entities.filter(e => e.health > 0).length
    const totalCount = combat.entities.length
    const combatName = getCombatName(combat)

    return (
        <div className="group relative bg-slate-800/80 border-2 border-slate-600 hover:border-amber-500/50 transition-all">
            <Link
                to="/combat/$id"
                params={{ id: combat.id! }}
                className="block p-4"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate retro group-hover:text-amber-400 transition-colors">
                            {combatName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <Swords className="w-4 h-4" />
                                Round {combat.currentRound}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {aliveCount}/{totalCount} alive
                            </span>
                            {combat.updatedAt && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(combat.updatedAt)}
                                </span>
                            )}
                        </div>
                        {role === 'player' && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-200/70">
                                <Crown className="w-3 h-3" />
                                DM: {combat.dungeonMaster}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={role === 'dm' ? 'default' : 'secondary'}>
                            {role === 'dm' ? 'DM' : 'Player'}
                        </Badge>
                        {combat.players.length > 0 && (
                            <span className="text-xs text-gray-500">
                                {combat.players.length} player{combat.players.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}

