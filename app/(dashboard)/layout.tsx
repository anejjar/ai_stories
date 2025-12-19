import { MainNav } from '@/components/nav/main-nav'
import { OnboardingManager, ChecklistWidget } from '@/components/onboarding'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MainNav />
      {children}
      <OnboardingManager />
      <ChecklistWidget />
    </>
  )
}
