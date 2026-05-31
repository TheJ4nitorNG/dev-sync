import { useAuthStore } from '@/stores/authStore'
import { useSnippetStore } from '@/stores/snippetStore'
import { useEffect, useState } from 'react'

export function UserPage() {
  const { email, username, bioStatus, updateProfile, logout } = useAuthStore()
  const { snippets, fetchSnippets, invites, fetchInvites, respondToInvite } = useSnippetStore()

  const [newUsername, setNewUsername] = useState(username || '')
  const [newBio, setNewBio] = useState(bioStatus || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchSnippets({ saved: true })
    fetchInvites()
  }, [fetchSnippets, fetchInvites])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMsg('')
    try {
      await updateProfile({ username: newUsername, bioStatus: newBio })
      setMsg('Profile updated successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err: any) {
      console.error('[UserPage] Update failed:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Update failed'
      setMsg(`Error: ${errorMsg}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const savedCount = snippets.length
  const initials = username?.substring(0, 2).toUpperCase() || email?.substring(0, 2).toUpperCase() || 'DS'

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
              {username || 'Developer'}<span className="text-accent">.</span>
            </h1>
            <p className="text-dim font-mono text-[10px] uppercase tracking-widest">
              {email}
            </p>
          </div>
        </div>

        {/* Pending Invitations Section */}
        {invites.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-mono font-bold text-accent uppercase tracking-[0.2em] mb-4 pb-2 border-b border-accent/30 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Pending Invitations ({invites.length})
            </h2>
            <div className="grid gap-3">
              {invites.map((inv) => (
                <div key={inv.snippetId} className="flex items-center justify-between p-4 card bg-accent/5 border-accent/20 animate-fade-up">
                  <div>
                    <p className="text-sm font-bold text-white">{inv.snippet.title}</p>
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-0.5">
                      From {inv.snippet.owner.username || inv.snippet.owner.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => respondToInvite(inv.snippetId, 'Accepted')}
                      className="bg-accent text-black px-4 py-1.5 rounded-lg text-[10px] font-bold hover:scale-105 transition-transform"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToInvite(inv.snippetId, 'Rejected')}
                      className="text-dim hover:text-white px-3 py-1.5 text-[10px] font-bold"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profile Settings */}
        <section className="mb-12">
          <h2 className="text-xs font-mono font-bold text-muted uppercase tracking-[0.2em] mb-4 pb-2 border-b border-border/30">
            Profile Settings
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-mono text-dim uppercase tracking-widest ml-1">Username</label>
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Set your username"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-accent transition-all text-white placeholder-dim"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-mono text-dim uppercase tracking-widest ml-1">Saved Items</label>
                <div className="w-full bg-card/30 border border-border/30 rounded-xl px-4 py-3 text-sm font-bold text-accent">
                  {savedCount} snippets
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-mono text-dim uppercase tracking-widest ml-1">Status / Bio</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="What are you working on?"
                rows={3}
                maxLength={140}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-accent transition-all text-white placeholder-dim resize-none"
              />
              <p className="text-[9px] text-right text-dim font-mono">{newBio.length}/140</p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className={`text-[10px] font-mono ${msg.includes('Error') ? 'text-accent3' : 'text-accent'}`}>
                {msg}
              </p>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-accent px-8 py-2.5 text-xs flex-shrink-0 disabled:opacity-50"
              >
                {isUpdating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* Account Actions */}
        <section>
          <h2 className="text-xs font-mono font-bold text-muted uppercase tracking-[0.2em] mb-4 pb-2 border-b border-border/30">
            Session
          </h2>
          <div className="grid gap-3">
            <button 
              onClick={logout}
              className="flex items-center justify-between px-5 py-4 card bg-accent3/5 border-accent3/10 hover:bg-accent3/10 hover:border-accent3/30 transition-all group text-left w-full"
            >
              <div>
                <p className="text-sm font-bold text-accent3">Sign Out</p>
                <p className="text-[10px] text-accent3/60 font-mono uppercase mt-1">Log out of your current session</p>
              </div>
              <span className="text-accent3/50 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
