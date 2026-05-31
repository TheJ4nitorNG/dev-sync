import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, forwardRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import clsx from 'clsx'

interface Folder { id: string; name: string }

const FOLDER_COLORS = ['#4dc9ff','#a78bfa','#ffca3a','#ff6b6b','#4fffb0','#f472b6']

const NAV = [
  {
    to: '/', label: 'All Snippets', end: true,
    icon: (
      <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
        <rect x="0" y="0" width="6" height="6" rx="1.5"/>
        <rect x="8" y="0" width="6" height="6" rx="1.5"/>
        <rect x="0" y="8" width="6" height="6" rx="1.5"/>
        <rect x="8" y="8" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/users', label: 'Developer Index', end: false,
    icon: (
      <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
        <circle cx="7" cy="4" r="3"/>
        <path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      </svg>
    ),
  },
  {
    to: '/messages', label: 'Direct Messages', end: false,
    icon: (
      <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M0 2a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H4l-4 2V2zm2 1v7h10V2H2v1z"/>
      </svg>
    ),
  },
  {
    to: '/account', label: 'Dashboard', end: false,
    icon: (
      <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 1.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 11c-1.84 0-3.45-.96-4.38-2.4.03-1.45 2.92-2.25 4.38-2.25 1.45 0 4.35.8 4.38 2.25-.93 1.44-2.54 2.4-4.38 2.4z"/>
      </svg>
    ),
  },
]

export const Sidebar = forwardRef<HTMLElement>((_, ref) => {
  const { email, username, logout } = useAuthStore()
  const nav = useNavigate()
  const location = useLocation()
  const [folders, setFolders] = useState<Folder[]>([])
  const [newFolder, setNewFolder] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const initials = username?.slice(0, 2).toUpperCase() || (email ? email.slice(0, 2).toUpperCase() : 'U')

  useEffect(() => {
    api.folders.list()
      .then((r) => setFolders(r.data ?? []))
      .catch(() => {})
  }, [])

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolder.trim()) return
    try {
      const res = await api.folders.create(newFolder.trim())
      setFolders((f) => [...f, res.data])
      setNewFolder('')
      setAddingFolder(false)
    } catch {}
  }

  const activeFolder = new URLSearchParams(location.search).get('folder')

  return (
    <aside
      ref={ref}
      className="flex flex-col flex-shrink-0 z-50 transition-all duration-300 bg-surface border-r border-border h-screen sticky top-0"
      style={{ width: collapsed ? 60 : 220 }}
    >
      {/* -- Logo -- */}
      <div className="px-4 py-[18px] border-b border-border flex items-center gap-2.5 flex-shrink-0 overflow-hidden">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-7 h-7 bg-accent rounded-md grid place-items-center flex-shrink-0 hover:bg-opacity-90 transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M2 4l5 3-5 3V4z" fill="#000"/>
            <rect x="9" y="6" width="5" height="1.4" rx=".7" fill="#000"/>
            <rect x="9" y="9" width="3" height="1.4" rx=".7" fill="#000"/>
          </svg>
        </button>
        {!collapsed && (
          <span className="font-extrabold text-[13px] tracking-tight whitespace-nowrap animate-fade-in">
            Dev<span className="text-accent">Sync</span>
          </span>
        )}
      </div>

      {/* -- Nav -- */}
      <nav className="flex-1 p-2 overflow-y-auto scrollbar-none">
        {!collapsed && (
          <p className="font-mono text-[9px] font-medium text-dim uppercase tracking-[0.14em] px-2.5 mb-1.5 mt-2">
            Workspace
          </p>
        )}

        {NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 mb-0.5 relative group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-card hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-14 bg-card border border-border text-white text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* -- Folders -- */}
        <div className="mt-4">
          {!collapsed && (
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <p className="font-mono text-[9px] font-medium text-dim uppercase tracking-[0.14em]">
                Folders
              </p>
              <button
                onClick={() => setAddingFolder((v) => !v)}
                className="text-dim hover:text-muted transition-colors w-5 h-5 rounded grid place-items-center hover:bg-card text-sm"
                title="New folder"
              >
                +
              </button>
            </div>
          )}

          {addingFolder && !collapsed && (
            <form onSubmit={createFolder} className="px-2 mb-2 animate-fade-in">
              <input
                autoFocus
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setAddingFolder(false)}
                placeholder="Folder name…"
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[11px] font-mono outline-none focus:border-accent transition-colors text-white placeholder-dim"
              />
            </form>
          )}

          {folders.map((f, i) => {
            const color = FOLDER_COLORS[i % FOLDER_COLORS.length]!
            const isActive = activeFolder === f.id
            return (
              <button
                key={f.id}
                onClick={() => nav(`/?folder=${f.id}`)}
                title={collapsed ? f.name : undefined}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-150 relative group',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-card text-white'
                    : 'text-dim hover:bg-card hover:text-muted',
                )}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color, boxShadow: isActive ? `0 0 8px ${color}88` : 'none' }}
                />
                {!collapsed && <span className="truncate">{f.name}</span>}
                {collapsed && (
                  <span className="absolute left-14 bg-card border border-border text-white text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    {f.name}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* -- Footer -- */}
      <div className="p-2.5 border-t border-border flex-shrink-0">
        <div
          className={clsx(
            'flex items-center gap-2.5 p-2 rounded-lg hover:bg-card cursor-pointer transition-colors',
            collapsed ? 'justify-center' : '',
          )}
          onClick={() => nav('/account')}
          title={collapsed ? `${username || email} • Account` : undefined}
        >
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent2 grid place-items-center text-[10px] font-black text-black flex-shrink-0"
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-xs font-bold text-white truncate">{username || email}</p>
              <p className="text-[9px] font-mono text-muted uppercase tracking-widest">Account</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'
