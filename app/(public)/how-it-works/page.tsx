import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Heart, Wand2, BookOpen, Check, Clock, Sparkles } from 'lucide-react'
import { HowToSchema, ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'How to Create Personalized Stories for Your Child in 4 Simple Steps | AI Tales',
  description:
    'Learn how AI Tales works: Create personalized bedtime stories for your child in 4 simple steps. Tell us about your child, choose a theme, AI generates the story, and read together.',
  keywords: [
    'how to create personalized story for child',
    'how AI story generator works',
    'personalized story process',
    'how to make personalized bedtime story',
    'AI story creation process',
    'personalized story steps',
  ],
  openGraph: {
    title: 'How to Create Personalized Stories for Your Child | AI Tales',
    description: 'Learn how AI Tales works: Create personalized bedtime stories for your child in 4 simple steps.',
    url: 'https://ai-tales.com/how-it-works',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales How It Works' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Create Personalized Stories for Your Child | AI Tales',
    description: 'Learn how AI Tales works: Create personalized bedtime stories for your child in 4 simple steps.',
  },
}

const steps = [
  {
    step: '01',
    title: 'Tell Us About Your Child',
    description: 'Enter your child\'s name, age, interests, and personality traits. Choose reading level (optional). Our system learns what makes your child unique.',
    time: '30 seconds',
    icon: Users,
    details: [
      'Child\'s name and age',
      'Favorite interests and hobbies',
      'Personality traits',
      'Reading level (optional)',
      'Any specific learning goals',
    ],
  },
  {
    step: '02',
    title: 'Choose Story Theme & Values',
    description: 'Select from 25+ themes (adventure, kindness, courage, STEM, etc.). Pick a moral lesson or learning objective. Customize story length and tone.',
    time: '20 seconds',
    icon: Heart,
    details: [
      'Choose from 25+ story themes',
      'Select a moral lesson or value',
      'Pick learning objectives',
      'Customize story length',
      'Choose tone (calm, adventurous, etc.)',
    ],
  },
  {
    step: '03',
    title: 'AI Generates Your Story',
    description: 'Watch the AI craft a unique narrative. Our advanced AI (Google Gemini) creates a personalized story in 10-30 seconds. Real-time generation progress.',
    time: '10-30 seconds',
    icon: Wand2,
    details: [
      'AI analyzes your child\'s profile',
      'Crafts personalized narrative',
      'Weaves in interests and values',
      'Adapts to reading level',
      'Ensures age-appropriate content',
    ],
  },
  {
    step: '04',
    title: 'Read, Learn, and Bond Together',
    description: 'Beautiful story interface with interactive elements and questions. Save to library for re-reading. Create magical bedtime memories together.',
    time: 'Unlimited',
    icon: BookOpen,
    details: [
      'Read the personalized story',
      'Interactive comprehension questions',
      'Save to your library',
      'Re-read favorites anytime',
      'Share with family members',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <HowToSchema
        name="How to Create Personalized Stories for Your Child"
        description="Learn how to create personalized bedtime stories for your child using AI Tales in 4 simple steps."
        steps={steps.map(s => ({
          name: s.title,
          text: `${s.description} This step takes approximately ${s.time}.`,
        }))}
      />
      <ArticleSchema
        title="How to Create Personalized Stories for Your Child in 4 Simple Steps"
        description="Learn how AI Tales works: Create personalized bedtime stories for your child in 4 simple steps. Tell us about your child, choose a theme, AI generates the story, and read together."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'How It Works', url: 'https://ai-tales.com/how-it-works' },
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
              <span>Simple Process</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              How to Create Personalized Stories <br />
              <span className="text-playwize-purple">for Your Child in 4 Simple Steps</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Creating magical, personalized bedtime stories has never been easier. In less than 2 minutes, you can have a unique story starring your child, ready to read together.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
                <div className="flex items-start gap-6">
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-3xl bg-playwize-purple flex items-center justify-center shadow-lg">
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-playwize-orange text-white font-black text-sm flex items-center justify-center border-4 border-white shadow-md">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black text-gray-900">{step.title}</h2>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-bold text-gray-600">{step.time}</span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed">{step.description}</p>
                    <div className="grid md:grid-cols-2 gap-3 pt-4">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                          <span className="text-gray-600 font-medium text-sm">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Flow */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100">
            <h2 className="text-4xl font-black text-gray-900 text-center mb-8">
              The Complete Process Flow
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 flex-1">
                  <div className="h-16 w-16 rounded-2xl bg-playwize-purple text-white font-black flex items-center justify-center text-xl">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 text-center">{step.title}</h3>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-playwize-purple hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Common Questions About the Process
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How long does it take to create a story?',
                  a: 'The entire process takes less than 2 minutes. Story generation itself takes 10-30 seconds, depending on story length and complexity.',
                },
                {
                  q: 'Can I edit the story after it\'s generated?',
                  a: 'Yes! You can regenerate the story, adjust the tone, extend or shorten it, and make other modifications before sharing with your child.',
                },
                {
                  q: 'What if I don\'t like the generated story?',
                  a: 'You can regenerate the story with the same inputs, or adjust your preferences and create a new one. You have full control.',
                },
                {
                  q: 'Can I save stories for later?',
                  a: 'Absolutely! All stories are automatically saved to your library. You can access them anytime and re-read favorites.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-white space-y-3">
                  <h4 className="text-xl font-black text-gray-900">{faq.q}</h4>
                  <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8 bg-playwize-purple/10 p-12 rounded-[4rem] border-4 border-playwize-purple/20">
            <h2 className="text-4xl font-black text-gray-900">
              Ready to Create Your First Story?
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Experience how easy it is to create personalized bedtime stories. Start with 1 free story—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/signup">
                  Start Creating Stories
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-playwize-purple text-playwize-purple hover:bg-playwize-purple hover:text-white font-black text-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/story-examples">
                  See Examples First
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
              <Link href="/story-examples" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Story Examples
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/pricing" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Pricing
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/features/personalization" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Personalization
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
