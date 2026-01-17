'use client'

import { useEffect, useState } from 'react'
import { HelpCircle, Mail, Clock, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/support/contact-form'
import { MyTickets } from '@/components/support/my-tickets'
import { supabase } from '@/lib/supabase/client'

export default function SupportPage() {
  const [user, setUser] = useState<{ id: string; email: string; displayName?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          displayName: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name,
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-12 px-4 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            How can we <span className="text-playwize-purple">help?</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Have a question, found a bug, or need assistance? We're here to help!
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm">
          <ContactForm
            userEmail={user?.email}
            userName={user?.displayName}
            userId={user?.id}
          />
        </div>

        {/* My Tickets */}
        <MyTickets userId={user?.id} />

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-playwize-purple" />
            </div>
            <div>
              <p className="font-black text-gray-900">Response Time</p>
              <p className="text-sm text-gray-500">24-48 hours</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6 text-playwize-orange" />
            </div>
            <div>
              <p className="font-black text-gray-900">Email Support</p>
              <p className="text-sm text-gray-500">support@safeaistories.com</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-black text-gray-900">Billing Priority</p>
              <p className="text-sm text-gray-500">Faster response</p>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="bg-white p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-3xl">💡</span>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-black text-gray-900">Quick Tips</h3>
              <ul className="text-gray-500 font-medium text-sm mt-2 space-y-1">
                <li>• Include specific details about the issue</li>
                <li>• For billing issues, include your subscription email</li>
                <li>• Describe what you expected vs. what happened</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
