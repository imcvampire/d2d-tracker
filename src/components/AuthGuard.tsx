import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/8bit/button'
import { Shield, LogIn, Loader2 } from 'lucide-react'

interface AuthGuardProps {
    children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading, signInWithGoogle } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-800/80 border-4 border-amber-500/50 p-8 text-center">
                    <Shield className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2 retro">
                        Authentication Required
                    </h2>
                    <p className="text-gray-400 mb-6">
                        You need to sign in to access the Combat Tracker.
                    </p>
                    <Button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Sign in with Google
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

