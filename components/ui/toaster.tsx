'use client'

import { useEffect, useState } from 'react'
import { Toast } from './toast'
import type { ToastProps } from './toast'

export interface ToastData extends ToastProps {
  id: string
}

let toastIdCounter = 0
const toasts: ToastData[] = []
const listeners: Array<() => void> = []

function createToast(data: Omit<ToastData, 'id'>): string {
  const id = `toast-${++toastIdCounter}`
  const toast: ToastData = { ...data, id }
  toasts.push(toast)
  listeners.forEach((listener) => listener())
  
  // Auto remove after duration
  if (data.duration !== 0) {
    setTimeout(() => {
      removeToast(id)
    }, data.duration || 5000)
  }
  
  return id
}

function removeToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    listeners.forEach((listener) => listener())
  }
}

function useToasts() {
  const [toastList, setToastList] = useState<ToastData[]>([])

  useEffect(() => {
    const update = () => setToastList([...toasts])
    listeners.push(update)
    update()

    return () => {
      const index = listeners.indexOf(update)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return toastList
}

export function Toaster() {
  const toasts = useToasts()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in slide-in-from-right-5"
        >
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Export toast functions
export const toast = {
  success: (title: string, description?: string) =>
    createToast({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    createToast({ title, description, variant: 'error' }),
  warning: (title: string, description?: string) =>
    createToast({ title, description, variant: 'warning' }),
  info: (title: string, description?: string) =>
    createToast({ title, description, variant: 'info' }),
  default: (title: string, description?: string) =>
    createToast({ title, description, variant: 'default' }),
}

