import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { SnippetCommit } from '@dev-sync/types'
import { useAuthStore } from '@/stores/authStore'

export function CommitsPanel({ 
  snippetId, 
  getCurrentContent, 
  onClose,
  onViewDiff
}: { 
  snippetId: string
  getCurrentContent: () => string
  onClose: () => void 
  onViewDiff: (content: string | null) => void
}) {
  const [commits, setCommits] = useState<SnippetCommit[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const userId = useAuthStore((s) => s.userId)

  useEffect(() => {
    api.snippets.getCommits(snippetId)
      .then(setCommits)
      .catch((e) => setError(e.message || 'Failed to load commits'))
  }, [snippetId])

  const submitCommit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setError('')
    setLoading(true)
    try {
      const content = getCurrentContent()
      const newCommit = await api.snippets.createCommit(snippetId, { message, content })
      setCommits([newCommit, ...commits])
      setMessage('')
    } catch (err: any) {
      setError(err.message || 'Failed to create commit')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDiff = (commit: SnippetCommit) => {
    if (viewingId === commit.id) {
      setViewingId(null)
      onViewDiff(null)
    } else {
      setViewingId(commit.id)
      onViewDiff(commit.content)
    }
  }

  return (
    <div className="w-[320px] bg-surface border-l border-border h-full flex flex-col">
      <div className="h-14 border-b border-border px-4 flex justify-between items-center bg-card">
        <h3 className="font-bold text-xs tracking-wide uppercase text-muted">Version History</h3>
        <button onClick={onClose} className="text-dim hover:text-white transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <form onSubmit={submitCommit} className="flex flex-col gap-2 bg-card p-3 rounded-xl border border-border">
          <textarea
            placeholder="Commit message (e.g. Added error handling)"
            className="input-base text-xs resize-none h-16"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-accent3 font-mono text-[9px]">{error}</p>}
          <button 
            type="submit" 
            disabled={loading || !message.trim()} 
            className="btn-accent py-1.5 text-[10px] w-full disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Commit current code'}
          </button>
        </form>

        <div className="flex flex-col gap-3">
          {commits.length === 0 ? (
            <p className="text-muted text-xs text-center py-4 font-mono">No commits yet.</p>
          ) : (
            commits.map(commit => (
              <div key={commit.id} className="bg-bg border border-border rounded-lg p-3 group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/40 grid place-items-center text-[7px] text-accent font-black">
                      {commit.author.email.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-mono text-[10px] text-white truncate max-w-[100px]">
                      {commit.author.email.split('@')[0]}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-dim whitespace-nowrap">
                    {new Date(commit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  {commit.message}
                </p>
                <button
                  onClick={() => handleViewDiff(commit)}
                  className={`w-full py-1.5 text-[10px] rounded border transition-colors ${
                    viewingId === commit.id
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-surface border-border text-dim hover:text-white hover:border-border2'
                  }`}
                >
                  {viewingId === commit.id ? 'Close Diff' : 'View Diff vs Current'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}