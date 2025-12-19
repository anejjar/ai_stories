'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  BookOpen,
  Users,
  Palette,
  Compass,
  TrendingUp,
} from 'lucide-react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useRouter } from 'next/navigation'

const TASK_ICONS: Record<string, React.ReactNode> = {
  first_story: <BookOpen className="w-4 h-4" />,
  create_profile: <Users className="w-4 h-4" />,
  try_theme: <Palette className="w-4 h-4" />,
  customize_appearance: <Sparkles className="w-4 h-4" />,
  visit_discover: <Compass className="w-4 h-4" />,
  read_achievement: <TrendingUp className="w-4 h-4" />,
}

const TASK_ACTIONS: Record<string, string> = {
  first_story: '/create',
  create_profile: '/profile',
  try_theme: '/create',
  customize_appearance: '/profile',
  visit_discover: '/discover',
  read_achievement: '/achievements',
}

export function ChecklistWidget() {
  const router = useRouter()
  const {
    onboardingChecklist,
    checklistProgress,
    shouldShowChecklist,
    completeChecklist,
    dismissChecklist,
  } = useOnboarding()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!shouldShowChecklist || !onboardingChecklist) {
    return null
  }

  const handleTaskClick = (taskId: string, completed: boolean) => {
    if (completed) return // Already completed

    // Navigate to relevant page
    const action = TASK_ACTIONS[taskId]
    if (action) {
      router.push(action)
    }
  }

  const handleDismiss = async () => {
    await dismissChecklist()
  }

  const isCompleted = checklistProgress.percentage === 100

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-300 overflow-hidden">
        {/* Header */}
        <div
          className={`
            px-4 py-3 cursor-pointer
            ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-primary'}
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <div>
                <h3 className="font-comic font-bold text-sm">
                  {isCompleted ? 'All Done!' : 'Getting Started'}
                </h3>
                <p className="text-xs opacity-90">
                  {checklistProgress.completed} of {checklistProgress.total} complete
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <Badge className="bg-white/20 text-white border-white/30">
                  {checklistProgress.percentage}%
                </Badge>
              )}
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {!isCompleted && (
            <div className="mt-2 bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${checklistProgress.percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Checklist Items */}
        {isExpanded && (
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
            {isCompleted && (
              <div className="text-center py-4 space-y-2">
                <div className="text-5xl">🎉</div>
                <h4 className="font-comic text-lg font-bold text-gray-900">
                  You're all set!
                </h4>
                <p className="text-sm text-gray-600">
                  You've completed all the getting started tasks. Enjoy creating magical stories!
                </p>
              </div>
            )}

            {onboardingChecklist.items.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleTaskClick(item.id, item.completed)}
                disabled={item.completed}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                  ${
                    item.completed
                      ? 'border-green-200 bg-green-50 cursor-default'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                  }
                `}
              >
                <div
                  className={`
                    flex-shrink-0
                    ${item.completed ? 'text-green-600' : 'text-gray-400'}
                  `}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>

                <div
                  className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${
                      item.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                    }
                  `}
                >
                  {TASK_ICONS[item.id]}
                </div>

                <span
                  className={`
                    flex-1 text-sm font-medium
                    ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}
                  `}
                >
                  {item.label}
                </span>
              </button>
            ))}

            {/* Dismiss Button */}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-gray-700 mt-2"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss checklist
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
