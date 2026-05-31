import { useAuthStore } from '@/stores/authStore'
import { useSnippetStore } from '@/stores/snippetStore'
import { useEffect, useMemo } from 'react'

export function UserPage() {
  const { email, userId, logout } = useAuthStore()
  const { snippets, fetchSnippets } = useSnippetStore()

  useEffect(() => {
    fetchSnippets({ saved: true })
  }, [fetchSnippets])

  const savedCount = snippets.length
  const initials = email?.substring(0, 2).toUpperCase() ?? 'DS'

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-7 overflow-auto">
      <div className="w-full max-w-2xl animate-fade-up">
        
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-3xl bg-accent grid place-items-center text-black text-2xl font-black shadow-2xl shadow-accent/20">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
              Account Dashboard<span className="text-accent">.</span>
            </h1>
            <p className="text-dim font-mono text-[10px] uppercase tracking-widest">
              Manage your profile and personal collection
            </p>
          </div>
        </div>

        {/* Account Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="card p-5 bg-card/50 backdrop-blur-sm border-border/50">
            <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Email Address</p>
            <p className="text-lg font-bold text-white tracking-tight">{email}</p>
          </div>
          <div className="card p-5 bg-card/50 backdrop-blur-sm border-border/50">
            <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Saved Snippets</p>
            <p className="text-lg font-bold text-accent tracking-tight">{savedCount} items</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-mono font-bold text-muted uppercase tracking-[0.2em] mb-4 pb-2 border-b border-border/30">
              Account Actions
            </h2>
            <div className="grid gap-3">
              <button 
                onClick={() => alert('Change password feature coming soon')}
                className="flex items-center justify-between px-5 py-4 card bg-card/30 border-border/30 hover:border-border transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">Change Password</p>
                  <p className="text-[10px] text-dim font-mono uppercase mt-1">Update your login security</p>
                </div>
                <span className="text-muted group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button 
                onClick={logout}
                className="flex items-center justify-between px-5 py-4 card bg-accent3/5 border-accent3/10 hover:bg-accent3/10 hover:border-accent3/30 transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-accent3">Sign Out</p>
                  <p className="text-[10px] text-accent3/60 font-mono uppercase mt-1">Log out of your current session</p>
                </div>
                <span className="text-accent3/50 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </section>

          <section className="pt-6">
             <div className="p-6 rounded-2xl bg-gradient-to-br from-card/80 to-bg border border-border/50 text-center">
                <p className="text-dim font-mono text-[10px] uppercase tracking-widest mb-2">Pro Tip</p>
                <p className="text-sm text-muted leading-relaxed">
                  You can save any public snippet to your collection by clicking the <span className="text-accent font-bold">★</span> icon on the dashboard.
                </p>
             </div>
          </section>
        </div>

      </div>
    </div>
  )
}
