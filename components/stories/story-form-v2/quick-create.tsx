'use client'

import { motion } from 'framer-motion'
import { Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWizard, type LastStorySettings } from './wizard-context'
import { getTemplateById } from '@/lib/stories/templates'

interface QuickCreateProps {
  onQuickCreate: () => void
  disabled?: boolean
}

export function QuickCreate({ onQuickCreate, disabled }: QuickCreateProps) {
  const { lastSettings, hasLastSettings, applyLastSettings } = useWizard()

  if (!hasLastSettings || !lastSettings) {
    return null
  }

  const template = lastSettings.templateId ? getTemplateById(lastSettings.templateId) : null
  const displayAdjectives = lastSettings.adjectives.slice(0, 3).join(', ')
  const moreCount = lastSettings.adjectives.length > 3 ? lastSettings.adjectives.length - 3 : 0

  const handleClick = () => {
    applyLastSettings()
    onQuickCreate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-100">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-semibold text-purple-900">Quick Create</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              Last Story
            </Badge>
          </div>

          {/* Settings summary */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
            <span className="font-medium text-gray-900">{lastSettings.childName}</span>
            <span className="text-gray-400">•</span>
            <span>
              {template?.emoji} {template?.name || 'Story'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-purple-600">
              {displayAdjectives}
              {moreCount > 0 && ` +${moreCount}`}
            </span>
          </div>

          {/* Create button */}
          <Button
            onClick={handleClick}
            disabled={disabled}
            className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            Create with Same Settings
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
