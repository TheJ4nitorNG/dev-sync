import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  username: string | null
  bioStatus: string | null
  setAuth: (token: string, userId: string, email: string) => void
  sync: () => Promise<void>
  updateProfile: (data: { username?: string; bioStatus?: string }) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null, 
      userId: null, 
      email: null,
      username: null,
      bioStatus: null,

      setAuth: (token, userId, email) => set({ token, userId, email }),

      sync: async () => {
        if (!get().token) return
        try {
          const res = await api.auth.sync()
          set({
            userId: res.data.id,
            email: res.data.email,
            username: res.data.username,
            bioStatus: res.data.bioStatus,
          })
        } catch {
          // If sync fails, token might be invalid
          get().logout()
        }
      },

      updateProfile: async (payload) => {
        const res = await api.auth.updateProfile(payload)
        set({
          username: res.data.username,
          bioStatus: res.data.bioStatus,
        })
      },

      logout: () => {
        supabase.auth.signOut()
        set({ token: null, userId: null, email: null, username: null, bioStatus: null })
      },
    }),
    { name: 'dev-sync-auth' },
  ),
)

// Listen for Supabase auth changes and sync the store
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState()
  if (session) {
    store.setAuth(
      session.access_token,
      session.user.id,
      session.user.email ?? ''
    )
    // Always trigger a sync to get profile data (username/status) after login
    await store.sync()
  } else if (event === 'SIGNED_OUT') {
    store.logout()
  }
})
