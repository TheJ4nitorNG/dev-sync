import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User, SnippetSummary } from '@dev-sync/types'

interface UserState {
  users: (User & { _count: { snippets: number; savedSnippets: number } })[]
  loading: boolean
  userSavedSnippets: Record<string, SnippetSummary[]>
  fetchUsers: () => Promise<void>
  fetchUserSaved: (userId: string) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  userSavedSnippets: {},

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const res = await api.users.list()
      set({ users: res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchUserSaved: async (userId) => {
    try {
      const res = await api.users.getSaved(userId)
      set((s) => ({
        userSavedSnippets: { ...s.userSavedSnippets, [userId]: res.data }
      }))
    } catch {}
  },
}))
