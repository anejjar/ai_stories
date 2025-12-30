import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    SafetyBadge,
    NoCreditCardBadge,
    MoneyBackBadge,
    AdFreeBadge,
} from '@/components/trust-badges'
import { Shield, DollarSign, Users, CheckCircle, Star, Zap, Crown } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Pricing - Safe AI Bedtime Stories for Kids',
    description:
        'Choose the perfect plan for your family. Start with 1 free story, upgrade to unlimited text stories (PRO) or AI-illustrated picture books (FAMILY PLAN). Cancel anytime.',
    keywords: [
        'ai bedtime stories pricing',
        'bedtime story generator cost',
        'personalized stories subscription',
        'ai story app pricing',
        'family plan pricing',
    ],
}

export default function PricingPage() {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto space-y-20">
      {/* Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
          <DollarSign className="h-4 w-4" />
          <span>Simple Pricing</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
          Choose Your <br />
          <span className="text-playwize-purple">Perfect Plan</span>
        </h1>
        <p className="text-xl text-gray-600 font-medium leading-relaxed">
          Start free, upgrade anytime. All plans include 100% kid-safe, personalized stories crafted by AI magic.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <SafetyBadge />
          <NoCreditCardBadge />
          <MoneyBackBadge />
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            name: 'Free Trial',
            price: '$0',
            sub: '/forever',
            desc: 'Try it risk-free',
            features: ['1 Free Story Generation', 'Save & View Your Story', '100% Kid-Safe Content', "Personalized with Child's Name"],
            icon: Star,
            color: 'border-gray-100',
            btnBg: 'bg-playwize-purple',
            tier: ''
          },
          {
            name: 'PRO',
            price: '$9.99',
            sub: '/month',
            desc: 'Most popular',
            features: ['Unlimited Text Stories', 'Multiple Story Drafts', 'Rewrite & Enhance Tools', '25+ Story Themes', 'Text-to-Speech Audio', 'Ad-Free Experience'],
            icon: Zap,
            color: 'border-playwize-purple shadow-xl shadow-purple-100',
            btnBg: 'bg-playwize-purple',
            popular: true,
            tier: 'pro'
          },
          {
            name: 'FAMILY PLAN',
            price: '$24.99',
            sub: '/month',
            desc: 'Perfect for families',
            features: ['Everything in PRO', 'Up to 3 Child Profiles', 'AI-Illustrated Stories', 'High-Res Picture Books', 'PDF Export for Printing', 'Advanced Art Styles'],
            icon: Crown,
            color: 'border-playwize-orange shadow-xl shadow-orange-100',
            btnBg: 'bg-playwize-orange',
            bestValue: true,
            tier: 'family'
          }
        ].map((plan, i) => (
          <div key={i} className={`bg-white rounded-[4rem] border-4 ${plan.color} p-12 relative flex flex-col justify-between group hover:scale-[1.02] transition-all`}>
            {plan.bestValue && (
              <div className="absolute top-8 right-[-40px] bg-playwize-orange text-white px-12 py-2 rotate-45 font-black text-xs">
                BEST VALUE ✨
              </div>
            )}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${plan.bestValue ? 'bg-orange-50 text-playwize-orange' : 'bg-purple-50 text-playwize-purple'} flex items-center justify-center`}>
                  <plan.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 font-bold text-sm">{plan.desc}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 font-bold">{plan.sub}</span>
              </div>

              <ul className="space-y-4">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 font-bold text-gray-600">
                    <CheckCircle className={`h-5 w-5 ${plan.bestValue ? 'text-playwize-orange' : 'text-playwize-purple'} shrink-0 mt-0.5`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12">
              <Link href={`/signup${plan.tier ? `?tier=${plan.tier}` : ''}`}>
                <Button className={`w-full h-16 rounded-full ${plan.btnBg} text-white font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95`}>
                  {plan.name === 'Free Trial' ? 'Start Free Trial' : `Get ${plan.name} Now`}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-[4rem] border-4 border-gray-100 shadow-sm overflow-hidden p-8 md:p-16 space-y-12">
        <h2 className="text-4xl font-black text-center text-gray-900">
          Compare All <span className="text-playwize-purple">Features</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-gray-100">
                <th className="p-6 text-left font-black text-gray-400 uppercase tracking-widest text-xs">Feature</th>
                <th className="p-6 text-center font-black text-gray-900">Free</th>
                <th className="p-6 text-center font-black text-playwize-purple">PRO</th>
                <th className="p-6 text-center font-black text-playwize-orange">FAMILY PLAN</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {[
                { feature: 'Child Profiles', free: '1', pro: '2', family: '3' },
                { feature: 'Text Stories/Day', free: '1 (lifetime)', pro: 'Unlimited', family: '10' },
                { feature: 'Illustrated Stories/Day', free: '—', pro: '—', family: '2' },
                { feature: 'Story Drafts', free: '—', pro: 'Multiple', family: 'Multiple' },
                { feature: 'Rewrite Tools', free: '—', pro: '✓', family: '✓' },
                { feature: 'Text-to-Speech', free: '—', pro: '✓', family: '✓' },
                { feature: 'PDF Export', free: '—', pro: '—', family: '✓' },
                { feature: 'Custom Art Styles', free: '—', pro: '—', family: '✓' },
              ].map((row, idx) => (
                <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-bold text-gray-700">{row.feature}</td>
                  <td className="p-6 text-center text-gray-500 font-medium">{row.free}</td>
                  <td className="p-6 text-center text-playwize-purple font-black">{row.pro}</td>
                  <td className="p-6 text-center text-playwize-orange font-black">{row.family}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-12 max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-center text-gray-900">
          Pricing <span className="text-playwize-orange">FAQs</span>
        </h2>
        <div className="grid gap-6">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription anytime with one click in your profile settings.' },
            { q: 'Is there a money-back guarantee?', a: 'Absolutely! We offer a 30-day money-back guarantee if you are not satisfied.' },
            { q: 'Do I need a credit card for the free trial?', a: 'No! The free trial gives you 1 story with no credit card required.' },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm hover:border-playwize-purple transition-all">
              <h4 className="text-xl font-black text-gray-900 mb-4">{faq.q}</h4>
              <p className="text-gray-600 font-bold leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-playwize-purple rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="space-y-8 relative z-10">
          <div className="text-7xl animate-bounce-slow inline-block">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black">
            Ready to Transform Bedtime?
          </h2>
          <p className="text-white/80 text-xl font-bold max-w-2xl mx-auto">
            Start your free trial today—no credit card required!
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="h-16 px-12 rounded-full bg-white text-playwize-purple hover:bg-gray-100 font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Start Free Trial 🎉
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
