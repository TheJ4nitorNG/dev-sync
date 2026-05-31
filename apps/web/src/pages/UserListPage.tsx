import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { SnippetCard } from '@/components/snippets/SnippetCard'

export function UserListPage() {
  const { users, loading, fetchUsers, userSavedSnippets, fetchUserSaved } = useUserStore()
  const { userId: currentUserId } = useAuthStore()
  const [search, setSearch] = useState('')
  const [viewingSaved, setViewingSaved] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter(u => 
    u.id !== currentUserId && 
    (u.username?.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleViewSaved = (userId: string) => {
    if (viewingSaved === userId) {
      setViewingSaved(null)
    } else {
      fetchUserSaved(userId)
      setViewingSaved(userId)
    }
  }

  return (
    <div className="flex-1 flex flex-col py-12 px-7 overflow-auto">
      <div className="w-full max-w-4xl mx-auto animate-fade-up">
        
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-white mb-3">
            Developer Index<span className="text-accent">.</span>
          </h1>
          <p className="text-dim font-mono text-[11px] uppercase tracking-[0.2em]">
            Discover and connect with other developers on the network
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-10 group">
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email…"
            className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-mono outline-none focus:border-accent transition-all text-white placeholder-dim shadow-xl focus:shadow-accent/5"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-accent transition-colors font-mono text-[10px]">
            {filteredUsers.length} FOUND
          </span>
        </div>

        {loading && users.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-6 h-32 skeleton" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex flex-col gap-3">
                <div className={`card p-6 flex items-start gap-5 hover:border-border2 transition-all group relative overflow-hidden ${viewingSaved === user.id ? 'border-accent/40 bg-accent/[0.02]' : ''}`}>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 grid place-items-center text-accent text-xl font-black flex-shrink-0 group-hover:bg-accent group-hover:text-black transition-colors">
                    {user.username?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-white truncate text-lg tracking-tight">
                          {user.username || 'Anonymous'}
                        </p>
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/5 text-dim border border-white/5 uppercase tracking-widest">
                          {user._count.snippets} Snippets · {user._count.savedSnippets} Saved
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleViewSaved(user.id)}
                          className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                            viewingSaved === user.id ? 'text-accent' : 'text-dim hover:text-white'
                          }`}
                        >
                          {viewingSaved === user.id ? 'Close Collection' : 'View Collection'}
                        </button>
                        <button 
                          onClick={() => nav(`/messages/${user.id}`)}
                          className="text-[10px] font-mono font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest hover:underline"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-dim font-mono mb-3 truncate">{user.email}</p>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 italic">
                      {user.bioStatus || "No status set."}
                    </p>
                  </div>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Inline Saved Snippets View */}
                {viewingSaved === user.id && (
                  <div className="ml-14 pl-5 border-l border-border/50 py-2 animate-fade-down">
                    <p className="text-[9px] font-mono text-dim uppercase tracking-[0.2em] mb-4">
                      {user.username || 'Developer'}'s Public Collection
                    </p>
                    {userSavedSnippets[user.id] ? (
                      userSavedSnippets[user.id]!.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {userSavedSnippets[user.id]!.map((sn, i) => (
                            <SnippetCard key={sn.id} snippet={sn} index={i} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-dim italic">This user hasn't saved any snippets yet.</p>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-dim">
                        <div className="w-3 h-3 border border-dim/30 border-t-dim rounded-full animate-spin" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">Loading collection…</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="py-20 text-center border border-dashed border-border rounded-3xl">
             <p className="text-dim font-mono text-xs uppercase tracking-widest">No developers found matching your search</p>
          </div>
        )}

      </div>
    </div>
  )
}
