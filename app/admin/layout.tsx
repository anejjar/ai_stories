import { verifyAdminAccess } from '@/lib/admin/verify-access'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin verification
  const hasAccess = await verifyAdminAccess()

  if (!hasAccess) {
    redirect('/dashboard?error=admin_access_required')
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminNav />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-white">{children}</main>
      </div>
    </div>
  )
}
