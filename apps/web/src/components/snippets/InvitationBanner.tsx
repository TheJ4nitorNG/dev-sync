import { useEffect } from 'react'
import { useSnippetStore } from '@/stores/snippetStore'

export function InvitationBanner() {
  const { invites, fetchInvites, respondToInvite } = useSnippetStore()

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  if (invites.length === 0) return null

  return (
    <div className="mx-7 mt-6 space-y-3">
      {invites.map((inv) => (
        <div 
          key={inv.snippetId} 
          className="bg-accent/10 border border-accent/20 rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-up shadow-xl shadow-accent/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent grid place-items-center text-black text-lg">
              ★
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Collaboration Invite: <span className="text-accent">"{inv.snippet.title}"</span>
              </p>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-0.5">
                Invited by {inv.snippet.owner.username || inv.snippet.owner.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => respondToInvite(inv.snippetId, 'Accepted')}
              className="bg-accent text-black px-5 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
            >
              Accept
            </button>
            <button
              onClick={() => respondToInvite(inv.snippetId, 'Rejected')}
              className="bg-card border border-border text-dim hover:text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
