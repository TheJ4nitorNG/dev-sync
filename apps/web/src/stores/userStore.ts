import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User } from '@dev-sync/types'

interface UserState {
  users: User[]
  loading: boolean
  fetchUsers: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const res = await api.users.list()
      set({ users: res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
