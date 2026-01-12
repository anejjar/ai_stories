import { MainNav } from '@/components/nav/main-nav'
import { OnboardingManager, ChecklistWidget } from '@/components/onboarding'
import { ErrorBoundary } from '@/components/error-boundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white">
        {/* Global Background Ornaments */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30" />
          <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30" />
          <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] blob-purple blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-10">
          <MainNav />
          {children}
          <OnboardingManager />
          <ChecklistWidget />
        </div>
      </div>
    </ErrorBoundary>
  )
}
