'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, ...props }, ref) => {
    const contextValue = React.useMemo(
      () => ({ value, onValueChange, name }),
      [value, onValueChange, name]
    )

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          role="radiogroup"
          {...props}
        />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const inputId = id || `radio-${value}`
    const isChecked = context.value === value
    const name = context.name || `radio-group-${Math.random().toString(36).substr(2, 9)}`

    return (
      <input
        ref={ref}
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={isChecked}
        onChange={(e) => {
          if (e.target.checked && context.onValueChange) {
            context.onValueChange(value)
          }
        }}
        className={cn(
          'h-4 w-4 shrink-0 rounded-full border-2 border-gray-300 text-playwize-purple focus:outline-none focus:ring-2 focus:ring-playwize-purple focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          'appearance-none cursor-pointer transition-all',
          isChecked && 'border-playwize-purple bg-white',
          className
        )}
        style={{
          backgroundImage: isChecked
            ? 'radial-gradient(circle, currentColor 40%, transparent 40%)'
            : 'none',
        }}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }

