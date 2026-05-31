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

      setAuth: (token, userId, email) => {
        // Prevent redundant state updates if nothing changed
        if (get().token === token && get().userId === userId) return
        set({ token, userId, email })
      },

      sync: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const res = await api.auth.sync()
          set({
            userId: res.data.id,
            email: res.data.email,
            username: res.data.username,
            bioStatus: res.data.bioStatus,
          })
        } catch (err) {
          console.error('[AuthStore] Sync failed:', err)
          // We DON'T call logout here to avoid login loops.
          // The user still has a valid Supabase session.
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
    const isNewToken = store.token !== session.access_token
    
    store.setAuth(
      session.access_token,
      session.user.id,
      session.user.email ?? ''
    )

    // Only sync on initial session, sign in, or token refresh
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || isNewToken) {
      await store.sync()
    }
  } else if (event === 'SIGNED_OUT') {
    // Only call logout if we actually have state to clear
    if (store.token) {
      store.logout()
    }
  }
})
