import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Brain, Rocket, Zap, ShieldCheck, Palette, Volume2, Check } from 'lucide-react'
import { ArticleSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'Complete Features Overview - AI Story Generator for Kids | AI Tales',
  description:
    'Discover all features of AI Tales: personalized children\'s stories, educational storytelling, unlimited AI story generation, interactive learning, safe content, and more. Perfect for families.',
  keywords: [
    'AI story generator features',
    'personalized story features',
    'educational storytelling features',
    'AI stories for kids features',
    'bedtime story generator features',
    'interactive story features',
    'family storytelling features',
  ],
  openGraph: {
    title: 'Complete Features Overview - AI Story Generator | AI Tales',
    description: 'Discover all features of AI Tales: personalized children\'s stories, educational storytelling, unlimited AI story generation, and more.',
    url: 'https://ai-tales.com/features',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Features' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Complete Features Overview - AI Story Generator | AI Tales',
    description: 'Discover all features of AI Tales: personalized children\'s stories, educational storytelling, unlimited AI story generation.',
  },
}

const features = [
  {
    title: 'Personalized Children\'s Stories',
    description: 'Not just dropping your child\'s name into a template. Our AI crafts entire narratives around your child\'s interests, personality traits, and learning level.',
    icon: Users,
    link: '/features/personalization',
    keyword: 'personalized children\'s stories',
  },
  {
    title: 'Educational Storytelling',
    description: 'Every story is designed by educators to build specific skills—vocabulary, reading comprehension, emotional intelligence, STEM concepts.',
    icon: Brain,
    link: '/features/educational-content',
    keyword: 'educational storytelling',
  },
  {
    title: 'Unlimited AI Story Generation',
    description: 'Unlike expensive personalized books ($40+ each), AI Tales gives you unlimited stories for $9.99/month. Never run out of adventures.',
    icon: Rocket,
    link: '/pricing',
    keyword: 'unlimited AI story generator',
  },
  {
    title: 'Interactive Learning Elements',
    description: 'Our stories include comprehension questions, choice-driven narratives, and creative prompts. Active engagement, not passive consumption.',
    icon: Zap,
    link: '/how-it-works',
    keyword: 'interactive stories for kids',
  },
  {
    title: 'Safe AI Content for Children',
    description: 'We use Google\'s safety filters plus human moderation to ensure every story is 100% kid-safe. No inappropriate content. No data selling. No ads.',
    icon: ShieldCheck,
    link: '/privacy',
    keyword: 'safe AI content for children',
  },
  {
    title: 'Family Storytelling App',
    description: 'The Family Plan supports up to 3 child profiles, each with personalized stories. Perfect for families with multiple children.',
    icon: Users,
    link: '/pricing',
    keyword: 'family storytelling app',
  },
  {
    title: 'AI-Illustrated Picture Books',
    description: 'Family Plan subscribers get AI-generated illustrations where your child appears as the hero. High-resolution picture books that rival expensive custom-printed books.',
    icon: Palette,
    link: '/pricing',
    keyword: 'AI-illustrated children\'s books',
  },
  {
    title: 'Bedtime Story Audio',
    description: 'Let AI Tales read the story while you cuddle. Perfect for exhausted parents or when you want to listen together. Professional narration.',
    icon: Volume2,
    link: '/how-it-works',
    keyword: 'bedtime story audio',
  },
]

export default function FeaturesPage() {
  return (
    <>
      <ArticleSchema
        title="Complete Features Overview - AI Story Generator for Kids"
        description="Discover all features of AI Tales: personalized children's stories, educational storytelling, unlimited AI story generation, interactive learning, safe content, and more."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
              <Rocket className="h-4 w-4" />
              <span>Complete Features</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Complete Features Overview <br />
              <span className="text-playwize-purple">AI Story Generator for Kids</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Discover everything AI Tales offers: personalized stories, educational content, unlimited generation, interactive learning, and more. All designed to make your child the hero of their own adventure.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Link
                key={idx}
                href={feature.link}
                className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 hover:border-playwize-purple transition-all hover:shadow-xl group space-y-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-playwize-purple/10 flex items-center justify-center group-hover:bg-playwize-purple transition-colors">
                  <feature.icon className="h-8 w-8 text-playwize-purple group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-sm">{feature.description}</p>
                <div className="flex items-center gap-2 text-playwize-purple font-bold text-sm group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Why These Features Matter */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Why These Features Matter
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-900">For Parents</h3>
                <ul className="space-y-3">
                  {[
                    'Save time creating engaging stories',
                    'Feel confident about screen time',
                    'Support your child\'s learning',
                    'Create lasting bedtime memories',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-900">For Children</h3>
                <ul className="space-y-3">
                  {[
                    'See themselves as the hero',
                    'Stories match their interests',
                    'Build reading confidence',
                    'Learn while having fun',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-playwize-orange shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-900">For Families</h3>
                <ul className="space-y-3">
                  {[
                    'Multiple children, one subscription',
                    'Quality bonding moments',
                    'Educational entertainment',
                    'Unlimited stories for all',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-black text-gray-900">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Start with 1 free story—no credit card required. See how AI Tales transforms bedtime into magical adventures.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-playwize-purple text-playwize-purple hover:bg-playwize-purple hover:text-white font-black text-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/features/personalization" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Personalization Details
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/features/educational-content" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Educational Approach
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
