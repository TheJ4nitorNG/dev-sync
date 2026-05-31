import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Message } from '@dev-sync/types'

interface MessageState {
  conversations: Record<string, Message[]>
  loading: boolean
  fetchConversation: (userId: string) => Promise<void>
  sendMessage: (receiverId: string, content: string) => Promise<void>
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: {},
  loading: false,

  fetchConversation: async (userId) => {
    set({ loading: true })
    try {
      const res = await api.messages.list(userId)
      set((s) => ({
        conversations: { ...s.conversations, [userId]: res.data },
        loading: false,
      }))
    } catch {
      set({ loading: false })
    }
  },

  sendMessage: async (receiverId, content) => {
    const res = await api.messages.send(receiverId, content)
    const newMessage = res.data
    set((s) => {
      const current = s.conversations[receiverId] || []
      return {
        conversations: { ...s.conversations, [receiverId]: [...current, newMessage] }
      }
    })
  },
}))
