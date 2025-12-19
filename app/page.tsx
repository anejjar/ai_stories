'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'

export default function Home() {
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error'
    message: string
  }>({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus({ type: 'idle', message: '' })

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const honeypot = String(formData.get('website') || '').trim()

    // If honeypot is filled, silently succeed on the client
    if (honeypot) {
      ;(event.target as HTMLFormElement).reset()
      const message =
        'You’re on the waitlist. We’ll email you before we launch and invite you to early access.'
      setStatus({
        type: 'success',
        message,
      })
      setModalMessage(message)
      setIsModalOpen(true)
      return
    }

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address.' })
      return
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailPattern.test(email)) {
      setStatus({
        type: 'error',
        message: 'That doesn’t look like a valid email. Please check and try again.',
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, hp: honeypot }),
      })

      const data = (await response.json()) as { ok: boolean; message?: string }

      if (!response.ok || !data.ok) {
        setStatus({
          type: 'error',
          message: data.message || 'Something went wrong. Please try again in a moment.',
        })
        return
      }

      ;(event.target as HTMLFormElement).reset()
      const message =
        data.message ||
        'You’re on the waitlist. We’ll email you before we launch and invite you to early access.'
      setStatus({
        type: 'success',
        message,
      })
      setModalMessage(message)
      setIsModalOpen(true)
    } catch {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again in a moment.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      {/* Starry background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),transparent_55%),radial-gradient(circle_at_bottom,_rgba(248,250,252,0.05),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(236,252,203,0.2),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(248,250,252,0.08),transparent_55%)]" />
      </div>

      <div className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-center">
          {/* Hero & form */}
          <section className="space-y-7" aria-labelledby="hero-heading">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-[11px] font-medium text-indigo-200 ring-1 ring-indigo-400/40 backdrop-blur">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300 ring-4 ring-emerald-400/30" />
              Early access for modern parents • Limited spots
            </div>

            <div className="space-y-4">
              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl lg:text-[2.9rem] font-semibold tracking-tight text-slate-50"
              >
                Turn bedtime into a magical story
                <span className="block text-indigo-200">where your child is the hero.</span>
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-slate-200/80 leading-relaxed">
                Safe AI-crafted bedtime stories, written just for your child in seconds — so you can slow down,
                snuggle in, and end the day with calm, connected moments that actually feel like magic.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Honeypot field to catch bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="email"
                    className="mb-1 block text-[11px] font-medium text-indigo-100/80"
                  >
                    Join the early access waitlist
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@familyemail.com"
                    className="block w-full rounded-full border border-indigo-300/40 bg-slate-900/60 px-5 py-3.5 text-base text-slate-50 shadow-sm outline-none ring-0 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/40"
                    aria-describedby="email-helper"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-7 py-3.5 text-sm sm:text-base font-semibold text-slate-900 shadow-[0_18px_40px_rgba(16,185,129,0.40)] transition hover:bg-emerald-300 hover:shadow-[0_22px_50px_rgba(16,185,129,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label="Join the AI Stories waitlist"
                >
                  {isSubmitting ? 'Joining…' : 'Join the waitlist'}
                  <span aria-hidden="true" className="ml-1.5">
                    ✨
                  </span>
                </button>
              </div>

              <p
                id="email-helper"
                className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300/90"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300/60 text-[10px] text-emerald-200">
                  ✓
                </span>
                Early access
                <span className="h-0.5 w-0.5 rounded-full bg-slate-500/70" />
                Kid-safe
                <span className="h-0.5 w-0.5 rounded-full bg-slate-500/70" />
                No spam
              </p>

              <p
                className={`min-h-[1.25rem] text-[11px] ${
                  status.type === 'success'
                    ? 'text-emerald-300'
                    : status.type === 'error'
                    ? 'text-rose-300'
                    : 'text-slate-300/80'
                }`}
                aria-live="polite"
              >
                {status.message}
              </p>
            </form>

            <div className="mt-3 grid gap-3 text-[11px] text-slate-200/80 sm:grid-cols-3">
              <div className="flex items-start gap-2 rounded-xl bg-slate-900/40 p-3 ring-1 ring-slate-700/60">
                <span className="mt-0.5 text-lg" aria-hidden>
                  🌙
                </span>
                <div>
                  <p className="font-semibold text-slate-50">Designed for calm</p>
                  <p className="leading-relaxed text-slate-300/90">
                    Stories tuned for gentle, sleepy endings – never loud, scary, or overstimulating.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-slate-900/40 p-3 ring-1 ring-slate-700/60">
                <span className="mt-0.5 text-lg" aria-hidden>
                  🔒
                </span>
                <div>
                  <p className="font-semibold text-slate-50">Privacy-first</p>
                  <p className="leading-relaxed text-slate-300/90">
                    Your child’s details stay private. No selling data, no hidden tracking.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-slate-900/40 p-3 ring-1 ring-slate-700/60">
                <span className="mt-0.5 text-lg" aria-hidden>
                  ❤️
                </span>
                <div>
                  <p className="font-semibold text-slate-50">You’re in control</p>
                  <p className="leading-relaxed text-slate-300/90">
                    Choose themes, tone, and length so every story feels right for your family.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key visual card */}
          <aside
            className="relative hidden lg:flex items-center justify-center"
            aria-label="How AI Stories works"
          >
            <div className="relative w-full max-w-md aspect-[16/10]">
              <Image
                src="/hero-bedtime.png"
                alt="Parent and child flying out of a glowing bedtime storybook with magical characters"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Success modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950/95 p-6 shadow-2xl ring-1 ring-slate-800">
            <h2 className="text-base font-semibold text-slate-50 mb-2">
              You’re on the waitlist ✨
            </h2>
            <p className="text-sm text-slate-200/90 leading-relaxed mb-5">
              {modalMessage ||
                'We’ve added your email to the list. We’ll reach out before launch with early access details.'}
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md shadow-emerald-400/40 transition hover:bg-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Final CTA band */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-300/90">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="space-y-1 text-left">
            <p className="text-sm font-semibold text-slate-50">
              Be among the first parents to experience AI-powered bedtime magic.
            </p>
            <p className="text-[11px] text-slate-300/90">
              Join the waitlist today — we’ll let you know the moment AI Stories is ready for your family.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const form = document.querySelector<HTMLFormElement>('form')
              form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              form?.querySelector<HTMLInputElement>('input[type="email"]')?.focus()
            }}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-[11px] font-semibold text-slate-900 shadow-md shadow-emerald-400/40 transition hover:bg-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Join the waitlist
          </button>
        </div>
        <div className="mt-4 text-[11px] text-slate-500">
          © {new Date().getFullYear()} AI Stories. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
