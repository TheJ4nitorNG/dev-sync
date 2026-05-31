import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NewSnippetPage } from '@/pages/NewSnippetPage'
import { SnippetPage } from '@/pages/SnippetPage'
import { UserPage } from '@/pages/UserPage'

export function App() {
  const token = useAuthStore((s) => s.token)

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="account" element={<UserPage />} />
        <Route path="snippets/new" element={<NewSnippetPage />} />
        <Route path="snippets/:id" element={<SnippetPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
