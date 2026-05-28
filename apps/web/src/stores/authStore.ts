import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  setAuth: (token: string, userId: string, email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, userId: null, email: null,
      setAuth: (token, userId, email) => set({ token, userId, email }),
      logout: () => {
        supabase.auth.signOut()
        set({ token: null, userId: null, email: null })
      },
    }),
    { name: 'dev-sync-auth' },
  ),
)

// Listen for Supabase auth changes and sync the store
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    useAuthStore.getState().setAuth(
      session.access_token,
      session.user.id,
      session.user.email ?? ''
    )
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout()
  }
})
