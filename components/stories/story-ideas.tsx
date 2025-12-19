'use client'

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { STORY_TEMPLATES, getTemplatesByCategory } from '@/lib/templates/story-ideas'
import type { StoryTemplate } from '@/types/discovery'

interface StoryIdeasProps {
  onSelectTemplate: (template: StoryTemplate) => void
}

export function StoryIdeas({ onSelectTemplate }: StoryIdeasProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'all' | StoryTemplate['category']>('all')

  const categories: Array<{ value: 'all' | StoryTemplate['category']; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'learning', label: 'Learning' },
    { value: 'bedtime', label: 'Bedtime' }
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? STORY_TEMPLATES
    : getTemplatesByCategory(selectedCategory)

  const displayTemplates = isExpanded ? filteredTemplates : filteredTemplates.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Story Ideas</h3>
        </div>
        <p className="text-sm text-gray-500">
          Need inspiration? Click any template to fill the form
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            size="sm"
            className={`
              rounded-full
              ${selectedCategory === category.value
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }
            `}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 group"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="space-y-3">
              {/* Icon & Title */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {template.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className="mt-1 border-purple-200 bg-purple-50 text-purple-700 text-xs capitalize"
                    >
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {template.previewText || template.description}
              </p>

              {/* Suggested Traits */}
              <div className="flex flex-wrap gap-1.5">
                {template.suggestedAdjectives.slice(0, 3).map((adj, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100"
                  >
                    {adj}
                  </span>
                ))}
              </div>

              {/* Action Hint */}
              <div className="text-xs text-purple-600 font-semibold group-hover:underline">
                Click to use this template →
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Show More/Less Button */}
      {filteredTemplates.length > 4 && (
        <div className="flex justify-center">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            className="rounded-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show More ({filteredTemplates.length - 4} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
