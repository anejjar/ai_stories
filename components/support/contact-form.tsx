'use client'

import { useState } from 'react'
import { Bug, UserX, CreditCard, HelpCircle, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface ContactFormProps {
  userEmail?: string
  userName?: string
  userId?: string
}

const CATEGORIES = [
  {
    id: 'bug_report',
    label: 'Bug Report',
    description: 'Something isn\'t working right',
    icon: Bug,
    color: 'bg-red-100 text-red-600 border-red-200',
    activeColor: 'bg-red-500 text-white border-red-500',
  },
  {
    id: 'account_issue',
    label: 'Account Issue',
    description: 'Login, profile, or access problems',
    icon: UserX,
    color: 'bg-blue-100 text-blue-600 border-blue-200',
    activeColor: 'bg-blue-500 text-white border-blue-500',
  },
  {
    id: 'billing_payment',
    label: 'Billing / Payment',
    description: 'Subscription or payment questions',
    icon: CreditCard,
    color: 'bg-green-100 text-green-600 border-green-200',
    activeColor: 'bg-green-500 text-white border-green-500',
  },
  {
    id: 'general_inquiry',
    label: 'General Question',
    description: 'Feedback, suggestions, or other',
    icon: HelpCircle,
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    activeColor: 'bg-purple-500 text-white border-purple-500',
  },
]

export function ContactForm({ userEmail = '', userName = '', userId }: ContactFormProps) {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [email, setEmail] = useState(userEmail)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!category) {
      newErrors.category = 'Please select a category'
    }
    if (!subject.trim() || subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters'
    }
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!message.trim() || message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors below')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          email: email.trim(),
          message: message.trim(),
          userId,
          userName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Too many requests', {
            description: 'Please wait before submitting another request.',
          })
        } else {
          toast.error(data.error || 'Failed to send message')
        }
        return
      }

      setTicketNumber(data.data.ticketNumber)
      setSubmitted(true)
      toast.success('Message sent!', {
        description: 'Check your email for confirmation.',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCategory('')
    setSubject('')
    setMessage('')
    setErrors({})
    setSubmitted(false)
    setTicketNumber('')
  }

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-[3rem] border-4 border-green-100 shadow-sm text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-gray-900">Message Sent!</h3>
          <p className="text-gray-500 font-bold">
            We've received your request and will get back to you soon.
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl">
          <p className="text-sm text-gray-500 font-bold">Your Reference Number</p>
          <p className="text-2xl font-black text-playwize-purple">{ticketNumber}</p>
        </div>
        <p className="text-sm text-gray-400">
          Check your email for a confirmation with this reference number.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-full font-bold"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Category Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
          What can we help with?
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id)
                  setErrors((prev) => ({ ...prev, category: '' }))
                }}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? cat.activeColor + ' shadow-lg scale-[1.02]'
                    : cat.color + ' hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <cat.icon className={`h-6 w-6 ${isSelected ? 'text-white' : ''}`} />
                  <div>
                    <p className={`font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {cat.label}
                    </p>
                    <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {cat.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {errors.category && (
          <p className="text-red-500 text-sm font-bold">{errors.category}</p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
          Subject
        </label>
        <Input
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value)
            if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }))
          }}
          placeholder="Brief description of your issue"
          className="h-14 rounded-2xl border-2 border-gray-100 px-5 font-bold focus:border-playwize-purple"
          maxLength={200}
        />
        <div className="flex justify-between">
          {errors.subject ? (
            <p className="text-red-500 text-sm font-bold">{errors.subject}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-400">{subject.length}/200</p>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
          Your Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
          }}
          placeholder="your@email.com"
          className="h-14 rounded-2xl border-2 border-gray-100 px-5 font-bold focus:border-playwize-purple"
        />
        {errors.email && (
          <p className="text-red-500 text-sm font-bold">{errors.email}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest">
          Message
        </label>
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            if (errors.message) setErrors((prev) => ({ ...prev, message: '' }))
          }}
          placeholder="Please describe your issue or question in detail..."
          className="min-h-[160px] rounded-2xl border-2 border-gray-100 p-5 font-bold focus:border-playwize-purple resize-none"
          maxLength={2000}
        />
        <div className="flex justify-between">
          {errors.message ? (
            <p className="text-red-500 text-sm font-bold">{errors.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-400">{message.length}/2000</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-16 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-3">
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <Send className="h-5 w-5" />
            Send Message
          </span>
        )}
      </Button>
    </form>
  )
}
