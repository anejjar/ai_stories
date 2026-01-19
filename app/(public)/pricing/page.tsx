import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Star, Zap, Crown, DollarSign, ArrowRight } from 'lucide-react'
import { ProductSchema, FAQSchema, ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'AI Story Generator Pricing - Simple, Transparent Plans | AI Tales',
  description:
    'Choose the perfect plan for your family. Start with 1 free story, upgrade to unlimited text stories ($9.99/month) or AI-illustrated picture books ($19.99/month). Cancel anytime.',
  keywords: [
    'AI story generator pricing',
    'personalized stories cost',
    'story subscription price',
    'AI bedtime stories pricing',
    'story generator cost',
    'family plan pricing',
  ],
  openGraph: {
    title: 'AI Story Generator Pricing | AI Tales',
    description: 'Choose the perfect plan for your family. Start with 1 free story, upgrade to unlimited text stories or AI-illustrated picture books.',
    url: 'https://ai-tales.com/pricing',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Pricing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Story Generator Pricing | AI Tales',
    description: 'Choose the perfect plan for your family. Start with 1 free story, upgrade to unlimited text stories or AI-illustrated picture books.',
  },
}

const pricingFAQs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! Cancel your subscription anytime with one click in your account settings. No questions asked.',
  },
  {
    question: 'Is there a money-back guarantee?',
    answer: 'Absolutely! We offer a 30-day money-back guarantee if you are not satisfied with AI Tales.',
  },
  {
    question: 'Do I need a credit card for the free trial?',
    answer: 'No! The free trial gives you 1 story with no credit card required. Experience the magic risk-free.',
  },
  {
    question: 'Can I switch plans?',
    answer: 'Yes, upgrade or downgrade anytime. Your billing will be prorated, and you can change plans from your account settings.',
  },
  {
    question: 'What happens after the free trial?',
    answer: 'You can keep your free story forever, or choose a paid plan to unlock unlimited stories. No pressure, no credit card required for the trial.',
  },
]

export default function PricingPage() {
  return (
    <>
      <ProductSchema name="AI Tales Pro Plan" description="Unlimited personalized AI stories for children" price="9.99" />
      <ProductSchema name="AI Tales Family Plan" description="AI-illustrated personalized stories for multiple children" price="19.99" />
      <FAQSchema questions={pricingFAQs} />
      <ArticleSchema
        title="AI Story Generator Pricing - Simple, Transparent Plans"
        description="Choose the perfect plan for your family. Start with 1 free story, upgrade to unlimited text stories ($9.99/month) or AI-illustrated picture books ($19.99/month). Cancel anytime."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Pricing', url: 'https://ai-tales.com/pricing' },
        ]}
      />
      <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          {/* Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
              <DollarSign className="h-4 w-4" />
              <span>Simple Pricing</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Simple, Transparent Pricing <br />
              <span className="text-playwize-purple">No Hidden Fees</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              Start free, upgrade anytime. All plans include 100% kid-safe, personalized stories crafted by AI magic. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free Trial',
                price: '$0',
                sub: '/forever',
                desc: 'Try it risk-free',
                features: [
                  '1 Free Story Generation',
                  'Save & View Your Story',
                  '100% Kid-Safe Content',
                  "Personalized with Child's Name"
                ],
                icon: Star,
                color: 'border-gray-200',
                btnBg: 'bg-playwize-purple',
                tier: '',
              },
              {
                name: 'Pro Plan',
                price: '$9.99',
                sub: '/month',
                desc: 'Perfect for One Child',
                features: [
                  'Unlimited Text Stories',
                  'Multiple Story Drafts (3 per request)',
                  'Rewrite & Enhance Tools',
                  '25+ Story Themes',
                  '10 Story Templates',
                  'Text-to-Speech Audio',
                  'Unlimited Storage',
                  'Ad-Free Experience'
                ],
                icon: Zap,
                color: 'border-playwize-purple shadow-xl shadow-purple-100',
                btnBg: 'bg-playwize-purple',
                popular: false,
                tier: 'pro',
              },
              {
                name: 'Family Plan',
                price: '$19.99',
                sub: '/month',
                desc: 'Perfect for Families with 2+ Kids',
                features: [
                  'Everything in Pro',
                  'Up to 3 Child Profiles',
                  '2 AI-Illustrated Stories per Day',
                  '10 Text Stories per Day',
                  'High-Resolution Picture Books',
                  'Child Appearance Customization',
                  'PDF Export (coming soon)',
                  'Advanced Art Styles',
                  'Family Dashboard'
                ],
                icon: Crown,
                color: 'border-playwize-orange shadow-xl shadow-orange-100',
                btnBg: 'bg-playwize-orange',
                bestValue: true,
                tier: 'family',
              },
            ].map((plan, i) => (
              <Card key={i} className={`bg-white rounded-[4rem] border-4 ${plan.color} p-12 relative flex flex-col justify-between group hover:scale-[1.02] transition-all`}>
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
                  {plan.price !== '$0' && (
                    <p className="text-xs text-gray-500 text-center">
                      or ${plan.price === '$9.99' ? '99' : '199'}/year - save 17%
                    </p>
                  )}

                  <ul className="space-y-4">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3 font-bold text-gray-600">
                        <Check className={`h-5 w-5 ${plan.bestValue ? 'text-playwize-orange' : 'text-playwize-purple'} shrink-0 mt-0.5`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-12">
                  <Button
                    asChild
                    className={`w-full h-16 rounded-full ${plan.btnBg} text-white font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95 min-h-[64px]`}
                  >
                    <Link href={`/signup${plan.tier ? `?tier=${plan.tier}` : ''}`}>
                      {plan.name === 'Free Trial' ? 'Start Free Trial' : `Get ${plan.name} Now`}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-white/60 rounded-[4rem] border-4 border-gray-100 shadow-sm overflow-hidden p-8 md:p-16 space-y-12">
            <h2 className="text-4xl font-black text-center text-gray-900">
              Compare All <span className="text-playwize-purple">Features</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-4 border-gray-100">
                    <th className="p-6 text-left font-black text-gray-400 uppercase tracking-widest text-xs">Feature</th>
                    <th className="p-6 text-center font-black text-gray-900">Free Trial</th>
                    <th className="p-6 text-center font-black text-playwize-purple">Pro Plan</th>
                    <th className="p-6 text-center font-black text-playwize-orange">Family Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-50">
                  {[
                    { feature: 'Child Profiles', free: '1', pro: '2', family: '3' },
                    { feature: 'Text Stories', free: '1 (lifetime)', pro: 'Unlimited', family: '10 per day' },
                    { feature: 'Illustrated Stories/Day', free: '—', pro: '—', family: '2' },
                    { feature: 'Story Drafts', free: '—', pro: 'Multiple (3 per request)', family: 'Multiple (3 per request)' },
                    { feature: 'Rewrite Tools', free: '—', pro: '✓', family: '✓' },
                    { feature: 'Text-to-Speech', free: '—', pro: '✓', family: '✓' },
                    { feature: 'PDF Export', free: '—', pro: '—', family: '✓ (coming soon)' },
                    { feature: 'Custom Art Styles', free: '—', pro: '—', family: '✓' },
                    { feature: '25+ Story Themes', free: '—', pro: '✓', family: '✓' },
                    { feature: 'Ad-Free Experience', free: '✓', pro: '✓', family: '✓' },
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
              {pricingFAQs.map((faq, idx) => (
                <div key={idx} className="bg-white/60 p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm hover:border-playwize-purple transition-all">
                  <h4 className="text-xl font-black text-gray-900 mb-4">{faq.question}</h4>
                  <p className="text-gray-600 font-bold leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-playwize-purple rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black">
                Ready to Transform Bedtime?
              </h2>
              <p className="text-white/80 text-xl font-bold max-w-2xl mx-auto">
                Start your free trial today—no credit card required! Experience the magic of personalized AI stories.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-12 rounded-full bg-white text-playwize-purple hover:bg-gray-100 font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95 min-w-[200px] min-h-[64px]"
                >
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 rounded-full border-2 border-white text-white hover:bg-white hover:text-playwize-purple font-black text-xl min-w-[200px] min-h-[64px]"
                >
                  <Link href="/story-examples">
                    See Examples First
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/features" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                All Features
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/how-it-works" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                How It Works
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/story-examples" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Story Examples
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
