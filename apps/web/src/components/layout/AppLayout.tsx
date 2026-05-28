import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg overflow-hidden">
      <Sidebar />
      <main className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
