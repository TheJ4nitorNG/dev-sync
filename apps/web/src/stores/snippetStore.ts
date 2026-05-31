import { create } from 'zustand'
import type { Snippet, SnippetSummary, CreateSnippetInput, Language } from '@dev-sync/types'
import { api } from '@/lib/api'
import { useAuthStore } from './authStore'

interface FetchParams {
  q?: string
  language?: Language
  tag?: string
  folder?: string
  saved?: boolean
}

interface SnippetState {
  snippets: SnippetSummary[]
  activeSnippet: Snippet | null
  invites: any[]
  loading: boolean
  fetchSnippets: (params?: FetchParams) => Promise<void>
  fetchSnippet: (id: string) => Promise<void>
  createSnippet: (data: CreateSnippetInput) => Promise<Snippet>
  deleteSnippet: (id: string) => Promise<void>
  saveSnippet: (id: string, folderId?: string) => Promise<void>
  unsaveSnippet: (id: string) => Promise<void>
  fetchInvites: () => Promise<void>
  respondToInvite: (snippetId: string, status: 'Accepted' | 'Rejected') => Promise<void>
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  snippets: [],
  activeSnippet: null,
  invites: [],
  loading: false,

  fetchSnippets: async (params) => {
    set({ loading: true })
    try {
      const res = await api.snippets.list(params)
      // Flatten nested tag join table from Prisma: tags[].tag → tags[]
      const items = (res.data as any[]).map((s: any) => ({
        ...s,
        tags: s.tags?.map((t: any) => t.tag ?? t) ?? [],
      }))
      set({ snippets: items as SnippetSummary[], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchSnippet: async (id) => {
    set({ loading: true })
    try {
      const res = await api.snippets.get(id)
      const s = res.data as any
      const snippet: Snippet = {
        ...s,
        tags: s.tags?.map((t: any) => t.tag ?? t) ?? [],
      }
      set({ activeSnippet: snippet, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createSnippet: async (payload) => {
    const res = await api.snippets.create(payload)
    const snippet = res.data as Snippet
    set((s) => ({ snippets: [snippet, ...s.snippets] }))
    return snippet
  },

  deleteSnippet: async (id) => {
    await api.snippets.remove(id)
    set((s) => ({
      snippets: s.snippets.filter((sn) => sn.id !== id),
      activeSnippet: s.activeSnippet?.id === id ? null : s.activeSnippet,
    }))
  },

  saveSnippet: async (id, folderId) => {
    await api.snippets.save(id, folderId)
    const userId = useAuthStore.getState().userId
    if (!userId) return

    set((s) => {
      const updateSnippet = (sn: any) => {
        if (sn.id !== id) return sn
        const savedBy = sn.savedBy || []
        if (savedBy.some((sv: any) => sv.userId === userId)) return sn
        return {
          ...sn,
          savedBy: [...savedBy, { userId, folderId: folderId || null }]
        }
      }

      return {
        snippets: s.snippets.map(updateSnippet),
        activeSnippet: s.activeSnippet?.id === id ? updateSnippet(s.activeSnippet) : s.activeSnippet
      }
    })
  },

  unsaveSnippet: async (id) => {
    await api.snippets.unsave(id)
    const userId = useAuthStore.getState().userId
    if (!userId) return

    set((s) => {
      const updateSnippet = (sn: any) => {
        if (sn.id !== id) return sn
        return {
          ...sn,
          savedBy: (sn.savedBy || []).filter((sv: any) => sv.userId !== userId)
        }
      }
      return {
        snippets: s.snippets.map(updateSnippet),
        activeSnippet: s.activeSnippet?.id === id ? updateSnippet(s.activeSnippet) : s.activeSnippet
      }
    })
  },

  fetchInvites: async () => {
    try {
      const res = await api.snippets.listInvites()
      set({ invites: res.data })
    } catch {}
  },

  respondToInvite: async (snippetId, status) => {
    await api.snippets.respondToInvite(snippetId, status)
    set((s) => ({
      invites: s.invites.filter((inv) => inv.snippetId !== snippetId)
    }))
    if (status === 'Accepted') {
      get().fetchSnippets()
    }
  },
}))
