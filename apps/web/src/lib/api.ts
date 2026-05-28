import axios from 'axios'
import type { CreateSnippetInput, UpdateSnippetInput } from '@dev-sync/types'
import { useAuthStore } from '@/stores/authStore'

const http = axios.create({
  baseURL: import.meta.env['VITE_API_URL']
    ? `${import.meta.env['VITE_API_URL']}/api`
    : '/api',
})

// Attach token to every request
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const api = {
  auth: {
    sync:   () => http.post('/auth/sync').then((r) => r.data),
  },

  snippets: {
    list:   (params?: { q?: string; language?: string; tag?: string; folder?: string }) =>
      http.get('/snippets', { params }).then((r) => r.data),
    get:    (id: string) => http.get(`/snippets/${id}`).then((r) => r.data),
    create: (data: CreateSnippetInput) => http.post('/snippets', data).then((r) => r.data),
    update: (id: string, data: UpdateSnippetInput) =>
      http.patch(`/snippets/${id}`, data).then((r) => r.data),
    remove: (id: string) => http.delete(`/snippets/${id}`).then((r) => r.data),
    invite: (id: string, email: string, role: 'Editor' | 'Viewer') =>
      http.post(`/snippets/${id}/collaborators`, { email, role }).then((r) => r.data),
    removeCollab: (id: string, userId: string) =>
      http.delete(`/snippets/${id}/collaborators/${userId}`).then((r) => r.data),
  },

  tags: {
    list:   () => http.get('/tags').then((r) => r.data),
    create: (name: string, color: string) => http.post('/tags', { name, color }).then((r) => r.data),
  },

  folders: {
    list:   () => http.get('/folders').then((r) => r.data),
    create: (name: string) => http.post('/folders', { name }).then((r) => r.data),
    remove: (id: string) => http.delete(`/folders/${id}`).then((r) => r.data),
  },
}
