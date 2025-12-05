'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = 'default', onClose, ...props }, ref) => {
    const icons = {
      success: <CheckCircle2 className="h-5 w-5" />,
      error: <AlertCircle className="h-5 w-5" />,
      warning: <AlertCircle className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />,
      default: <Sparkles className="h-5 w-5" />,
    }

    const variants = {
      success: 'bg-green-100 border-green-400 text-green-800',
      error: 'bg-red-100 border-red-400 text-red-800',
      warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
      info: 'bg-blue-100 border-blue-400 text-blue-800',
      default: 'bg-purple-100 border-purple-400 text-purple-800',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex items-start gap-3 rounded-2xl border-2 p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-5',
          variants[variant]
        )}
        {...props}
      >
        <div className="flex-shrink-0 text-2xl">
          {variant === 'success' && '✅'}
          {variant === 'error' && '❌'}
          {variant === 'warning' && '⚠️'}
          {variant === 'info' && 'ℹ️'}
          {variant === 'default' && '✨'}
        </div>
        <div className="flex-1">
          {title && (
            <div className="font-bold text-base mb-1">{title}</div>
          )}
          {description && (
            <div className="text-sm font-medium">{description}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

export { Toast }

