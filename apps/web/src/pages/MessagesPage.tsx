import { useEffect, useState, useRef } from 'react'
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
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (otherUserId) {
      fetchConversation(otherUserId)
    }
  }, [otherUserId, fetchConversation])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, otherUserId])

  const activeMessages = otherUserId ? conversations[otherUserId] || [] : []
  const otherUser = users.find(u => u.id === otherUserId)

  // List of users I have chatted with
  const conversationUsers = users.filter(u => 
    Object.keys(conversations).includes(u.id) || u.id === otherUserId
  )

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otherUserId || !content.trim() || isSending) return
    setIsSending(true)
    try {
      await sendMessage(otherUserId, content.trim())
      setContent('')
    } catch (err) {
      console.error('[MessagesPage] Send failed:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      
      {/* ── Conversation Sidebar ── */}
      <aside className="w-80 bg-surface border-r border-border flex flex-col">
        <header className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Chats</h1>
          <button 
            onClick={() => nav('/users')}
            className="w-8 h-8 rounded-lg bg-card border border-border grid place-items-center text-dim hover:text-white transition-colors"
            title="New Chat"
          >
            +
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversationUsers.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="text-2xl mb-3 opacity-20">💬</div>
              <p className="text-[10px] font-mono text-dim uppercase tracking-widest leading-relaxed">
                No active conversations
              </p>
              <button 
                onClick={() => nav('/users')}
                className="text-accent text-[9px] font-mono font-bold uppercase mt-4 hover:underline tracking-widest"
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
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                  otherUserId === u.id ? "bg-accent/10 border border-accent/20" : "hover:bg-card border border-transparent"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-card border border-border grid place-items-center text-xs font-black text-dim group-hover:border-accent/30 transition-colors">
                  {u.username?.substring(0, 2).toUpperCase() || u.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx("text-sm font-bold truncate", otherUserId === u.id ? "text-accent" : "text-white")}>
                    {u.username || u.email.split('@')[0]}
                  </p>
                  <p className="text-[9px] text-dim truncate font-mono uppercase tracking-tighter mt-0.5">
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
                  <p className="text-sm font-bold text-white tracking-tight">{otherUser?.username || otherUser?.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                    <p className="text-[9px] font-mono text-accent uppercase tracking-widest font-bold">Online</p>
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
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-30">
                      <div className="text-4xl mb-4">👋</div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
                        Start of your conversation with {otherUser?.username || 'this developer'}
                      </p>
                    </div>
                  )}
                  {activeMessages.map((m) => {
                    const isMe = m.senderId === currentUserId
                    return (
                      <div 
                        key={m.id} 
                        className={clsx(
                          "max-w-[80%] flex flex-col gap-1.5 animate-fade-up",
                          isMe ? "self-end items-end" : "self-start items-start"
                        )}
                      >
                        <div className={clsx(
                          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg",
                          isMe 
                            ? "bg-accent text-black font-semibold rounded-tr-none" 
                            : "bg-card border border-border text-white rounded-tl-none"
                        )}>
                          {m.content}
                        </div>
                        <span className="text-[9px] font-mono text-dim uppercase tracking-tighter px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <footer className="p-6 border-t border-border bg-surface/30">
              <form onSubmit={handleSend} className="flex gap-3 relative group max-w-4xl mx-auto w-full">
                <input
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Message ${otherUser?.username || 'developer'}…`}
                  className="flex-1 bg-card border border-border rounded-2xl px-5 py-4 text-sm font-mono outline-none focus:border-accent transition-all text-white placeholder-dim shadow-2xl focus:shadow-accent/5"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || isSending}
                  className="btn-accent px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 grid place-items-center opacity-30 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-8">📬</div>
              <p className="text-[11px] font-mono uppercase tracking-[0.4em] font-bold text-white mb-2">Private Messaging</p>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-dim max-w-xs mx-auto leading-relaxed">
                Connect with other developers to collaborate on snippets and architectural patterns.
              </p>
              <button 
                onClick={() => nav('/users')}
                className="mt-10 px-6 py-2.5 rounded-full border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
              >
                Find Developers
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
