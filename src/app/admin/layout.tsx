import type { ReactNode } from 'react'

import { redirect } from 'next/navigation'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { createClient } from '@/lib/supabase/server'

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: adminUser, error: adminError } =
    await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

  if (adminError || !adminUser) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-72">
        {children}
      </div>
    </div>
  )
}