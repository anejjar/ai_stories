import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Sparkles, Heart, Wand2, Check, BookOpen, Brain } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'Personalized Children\'s Stories That Actually Feel Personal | AI Tales',
  description:
    'Discover how AI Tales creates truly personalized children\'s stories. Not just name insertion—deep AI personalization that adapts to your child\'s interests, personality, and reading level.',
  keywords: [
    'personalized children\'s stories',
    'AI personalization for kids',
    'custom story personalization',
    'personalized bedtime stories',
    'AI story personalization',
    'custom children\'s stories',
    'personalized story generator',
  ],
  openGraph: {
    title: 'Personalized Children\'s Stories | AI Tales',
    description: 'Discover how AI Tales creates truly personalized children\'s stories. Deep AI personalization that adapts to your child\'s interests, personality, and reading level.',
    url: 'https://ai-tales.com/features/personalization',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Personalization Feature' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personalized Children\'s Stories | AI Tales',
    description: 'Discover how AI Tales creates truly personalized children\'s stories. Deep AI personalization that adapts to your child\'s interests.',
  },
}

export default function PersonalizationPage() {
  return (
    <>
      <ArticleSchema
        title="Personalized Children's Stories That Actually Feel Personal"
        description="Discover how AI Tales creates truly personalized children's stories. Not just name insertion—deep AI personalization that adapts to your child's interests, personality, and reading level."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Features', url: 'https://ai-tales.com/features' },
          { name: 'Personalization', url: 'https://ai-tales.com/features/personalization' },
        ]}
      />
      <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-16 relative z-10">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
              <Sparkles className="h-4 w-4" />
              <span>Deep Personalization</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Personalized Children's Stories <br />
              <span className="text-playwize-purple">That Actually Feel Personal</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Not just dropping your child's name into a template. Our AI crafts entire narratives around your child's interests, personality traits, and learning level. When Emma loves dinosaurs, her story features a T-Rex adventure. When Jake struggles with sharing, his story teaches empathy through his own heroic journey.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              How Our Personalization Engine Works
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  step: '01',
                  title: 'Child Profile Creation',
                  description: 'You provide your child\'s name, age, interests, personality traits, and reading level. Our system learns what makes your child unique.',
                  icon: Users,
                },
                {
                  step: '02',
                  title: 'AI Analysis',
                  description: 'Our advanced AI (Google Gemini) analyzes your child\'s profile to understand their preferences, learning style, and developmental stage.',
                  icon: Brain,
                },
                {
                  step: '03',
                  title: 'Story Crafting',
                  description: 'The AI crafts entire narratives that weave your child\'s interests and personality into the story. Your child becomes the hero, not just a name.',
                  icon: Wand2,
                },
                {
                  step: '04',
                  title: 'Adaptive Content',
                  description: 'Stories adapt to your child\'s reading level, using appropriate vocabulary and concepts. As they grow, stories grow with them.',
                  icon: BookOpen,
                },
              ].map((item, idx) => (
                <div key={idx} className="space-y-4 p-6 bg-gray-50 rounded-[3rem] border-2 border-white">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-playwize-purple text-white font-black flex items-center justify-center">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Real Examples of Personalization
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h3 className="text-2xl font-black text-gray-900">Before: Generic Story</h3>
                <p className="text-gray-600 font-medium italic">
                  "Once upon a time, there was a brave knight who went on an adventure..."
                </p>
                <p className="text-gray-500 text-sm">
                  Generic, one-size-fits-all story that doesn't engage your child.
                </p>
              </div>
              <div className="bg-playwize-purple/10 p-8 rounded-[3rem] border-2 border-playwize-purple space-y-4">
                <h3 className="text-2xl font-black text-gray-900">After: Personalized Story</h3>
                <p className="text-gray-700 font-medium italic">
                  "Emma, who loved dinosaurs more than anything, discovered a magical T-Rex egg in her backyard. The T-Rex needed her help to learn about sharing with other dinosaurs..."
                </p>
                <p className="text-playwize-purple font-bold text-sm">
                  Story features Emma's interests (dinosaurs) and teaches her about sharing—a skill she's learning.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Why Personalization Matters
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Increased Engagement',
                  description: 'Children are 3x more engaged when they see themselves as the hero of the story.',
                },
                {
                  title: 'Better Learning',
                  description: 'Personalized stories help children understand concepts through familiar contexts.',
                },
                {
                  title: 'Reading Confidence',
                  description: 'When children are the hero, reading becomes exciting, not scary.',
                },
                {
                  title: 'Emotional Connection',
                  description: 'Stories that reflect their interests create deeper emotional connections.',
                },
                {
                  title: 'Skill Development',
                  description: 'Personalized stories can target specific skills your child needs to develop.',
                },
                {
                  title: 'Bedtime Success',
                  description: 'Children actually look forward to bedtime when they know their story awaits.',
                },
              ].map((benefit, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-white space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-playwize-purple" />
                    <h4 className="text-xl font-black text-gray-900">{benefit.title}</h4>
                  </div>
                  <p className="text-gray-600 font-medium text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8 bg-playwize-purple/10 p-12 rounded-[4rem] border-4 border-playwize-purple/20">
            <h2 className="text-4xl font-black text-gray-900">
              Experience True Personalization
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              See how AI Tales creates stories that truly reflect your child. Start with 1 free story—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/signup">
                  Try It Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-playwize-purple text-playwize-purple hover:bg-playwize-purple hover:text-white font-black text-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/story-examples">
                  See Examples
                </Link>
              </Button>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/features" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                All Features
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/features/educational-content" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Educational Content
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/story-examples" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Story Examples
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/how-it-works" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                How It Works
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
