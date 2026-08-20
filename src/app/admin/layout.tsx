import type { ReactNode } from 'react'

import { AdminSidebar } from '@/components/admin/admin-sidebar'

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-72">
        {children}
      </div>
    </div>
  )
}