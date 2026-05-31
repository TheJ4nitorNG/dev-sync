import { useEffect, useState } from 'react'
import { useMessageStore } from '@/stores/messageStore'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useParams, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export function MessagesPage() {
  const { userId: otherUserId } = useParams<{ userId: string }>()
  const { conversations, fetchConversation, sendMessage, loading } = useMessageStore()
  const { userId: currentUserId } = useAuthStore()
  const { users, fetchUsers } = useUserStore()
  const nav = useNavigate()

  const [content, setContent] = useState('')
  const [sending, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (otherUserId) {
      fetchConversation(otherUserId)
    }
  }, [otherUserId, fetchConversation])

  const activeMessages = otherUserId ? conversations[otherUserId] || [] : []
  const otherUser = users.find(u => u.id === otherUserId)

  // Derived list of unique users we have conversations with
  const conversationUsers = users.filter(u => 
    Object.keys(conversations).includes(u.id) || u.id === otherUserId
  )

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otherUserId || !content.trim() || sending) return
    setSaving(true)
    try {
      await sendMessage(otherUserId, content.trim())
      setContent('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      
      {/* ── Conversation Sidebar ── */}
      <aside className="w-80 bg-surface border-r border-border flex flex-col">
        <header className="px-6 py-5 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversationUsers.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-[10px] font-mono text-dim uppercase tracking-widest">No active chats</p>
              <button 
                onClick={() => nav('/users')}
                className="text-accent text-[10px] font-mono uppercase mt-2 hover:underline"
              >
                Find developers →
              </button>
            </div>
          ) : (
            conversationUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => nav(`/messages/${u.id}`)}
                className={clsx(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  otherUserId === u.id ? "bg-accent/10 border border-accent/20" : "hover:bg-card border border-transparent"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-card border border-border grid place-items-center text-xs font-black text-dim">
                  {u.username?.substring(0, 2).toUpperCase() || u.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx("text-sm font-bold truncate", otherUserId === u.id ? "text-accent" : "text-white")}>
                    {u.username || u.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-dim truncate font-mono uppercase tracking-tighter">
                    {u.bioStatus || 'Developer'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat View ── */}
      <main className="flex-1 flex flex-col bg-bg relative">
        {otherUserId ? (
          <>
            {/* Chat Header */}
            <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent grid place-items-center text-black font-black text-[10px]">
                  {otherUser?.username?.substring(0, 2).toUpperCase() || otherUser?.email.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{otherUser?.username || otherUser?.email}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <p className="text-[9px] font-mono text-accent uppercase tracking-widest">Active</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {loading && activeMessages.length === 0 ? (
                <div className="flex-1 grid place-items-center">
                  <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {activeMessages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-40">
                      <div className="text-3xl mb-4">💬</div>
                      <p className="text-xs font-mono uppercase tracking-widest">Start of conversation</p>
                    </div>
                  )}
                  {activeMessages.map((m) => {
                    const isMe = m.senderId === currentUserId
                    return (
                      <div 
                        key={m.id} 
                        className={clsx(
                          "max-w-[80%] flex flex-col gap-1 animate-fade-up",
                          isMe ? "self-end items-end" : "self-start items-start"
                        )}
                      >
                        <div className={clsx(
                          "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                          isMe 
                            ? "bg-accent text-black font-medium rounded-tr-none" 
                            : "bg-card border border-border text-white rounded-tl-none"
                        )}>
                          {m.content}
                        </div>
                        <span className="text-[9px] font-mono text-dim uppercase tracking-tighter">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* Input */}
            <footer className="p-6 border-t border-border bg-surface/30">
              <form onSubmit={handleSend} className="flex gap-3 relative group">
                <input
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Message ${otherUser?.username || 'developer'}…`}
                  className="flex-1 bg-card border border-border rounded-2xl px-5 py-4 text-sm font-mono outline-none focus:border-accent transition-all text-white placeholder-dim shadow-xl focus:shadow-accent/5"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || sending}
                  className="btn-accent px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:grayscale transition-all"
                >
                  Send
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 grid place-items-center opacity-40">
            <div className="text-center">
              <div className="text-5xl mb-6">📬</div>
              <p className="text-xs font-mono uppercase tracking-[0.3em]">Select a developer to start chatting</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
