import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, BookOpen, GraduationCap, Target, Check, TrendingUp, Heart, Sparkles } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'Educational Storytelling That Doesn\'t Feel Like Homework | AI Tales',
  description:
    'Discover how AI Tales creates educational stories that teach vocabulary, reading comprehension, emotional intelligence, and STEM concepts. Curriculum-aligned content that makes learning fun.',
  keywords: [
    'educational storytelling',
    'educational AI stories',
    'learning through stories',
    'educational bedtime stories',
    'curriculum-aligned stories',
    'reading comprehension stories',
    'educational story app',
  ],
  openGraph: {
    title: 'Educational Storytelling | AI Tales',
    description: 'Discover how AI Tales creates educational stories that teach vocabulary, reading comprehension, emotional intelligence, and STEM concepts.',
    url: 'https://ai-tales.com/features/educational-content',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Educational Content' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Educational Storytelling | AI Tales',
    description: 'Discover how AI Tales creates educational stories that teach vocabulary, reading comprehension, emotional intelligence, and STEM concepts.',
  },
}

const learningOutcomes = [
  {
    skill: 'Reading Comprehension',
    description: 'Stories include questions that check understanding and encourage critical thinking.',
    icon: BookOpen,
  },
  {
    skill: 'Vocabulary Building',
    description: 'Age-appropriate vocabulary introduced naturally through context, expanding your child\'s word bank.',
    icon: TrendingUp,
  },
  {
    skill: 'Emotional Intelligence',
    description: 'Stories teach empathy, kindness, and social-emotional skills through relatable scenarios.',
    icon: Heart,
  },
  {
    skill: 'STEM Concepts',
    description: 'Science, technology, engineering, and math concepts woven into engaging narratives.',
    icon: GraduationCap,
  },
  {
    skill: 'Problem Solving',
    description: 'Interactive elements encourage children to think through challenges and find solutions.',
    icon: Target,
  },
  {
    skill: 'Creativity',
    description: 'Open-ended prompts and creative choices spark imagination and original thinking.',
    icon: Sparkles,
  },
]

export default function EducationalContentPage() {
  return (
    <>
      <ArticleSchema
        title="Educational Storytelling That Doesn't Feel Like Homework"
        description="Discover how AI Tales creates educational stories that teach vocabulary, reading comprehension, emotional intelligence, and STEM concepts. Curriculum-aligned content that makes learning fun."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Features', url: 'https://ai-tales.com/features' },
          { name: 'Educational Content', url: 'https://ai-tales.com/features/educational-content' },
        ]}
      />
      <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-16 relative z-10">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
              <Brain className="h-4 w-4" />
              <span>Educational Excellence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Educational Storytelling <br />
              <span className="text-playwize-orange">That Doesn't Feel Like Homework</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Every story is designed by educators to build specific skills—vocabulary, reading comprehension, emotional intelligence, STEM concepts. Your child learns without realizing they're learning. Reading becomes play, not work.
            </p>
          </div>

          {/* Curriculum Alignment */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Curriculum-Aligned Content
            </h2>
            <p className="text-lg text-gray-600 font-medium leading-relaxed text-center max-w-3xl mx-auto">
              Our stories are designed by educators and aligned with educational standards. Each story targets specific learning objectives while maintaining the magic of storytelling.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Common Core Standards alignment',
                'Head Start Early Learning Outcomes Framework',
                'Social-emotional learning (SEL) integration',
                'Age-appropriate skill development',
                'Progressive difficulty levels',
                'Measurable learning outcomes',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[2rem] border-2 border-white">
                  <Check className="h-6 w-6 text-playwize-orange shrink-0" />
                  <span className="text-gray-700 font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Skills Your Child Develops
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
                    <outcome.icon className="h-8 w-8 text-playwize-orange" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{outcome.skill}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-sm">{outcome.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Age-Appropriate Content */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              How Stories Adapt to Your Child's Age
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  age: 'Ages 3-5',
                  focus: 'Early Literacy',
                  description: 'Simple vocabulary, basic concepts, visual storytelling, and foundational social skills.',
                },
                {
                  age: 'Ages 6-8',
                  focus: 'Reading Fluency',
                  description: 'Expanded vocabulary, comprehension questions, problem-solving, and emotional awareness.',
                },
                {
                  age: 'Ages 9-12',
                  focus: 'Advanced Skills',
                  description: 'Complex narratives, STEM concepts, critical thinking, and character development.',
                },
              ].map((group, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-[3rem] border-2 border-white space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-playwize-purple text-white font-black flex items-center justify-center">
                      {group.age.split('-')[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900">{group.age}</h4>
                      <p className="text-playwize-purple font-bold text-sm">{group.focus}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium text-sm leading-relaxed">{group.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Proven Educational Results
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  stat: '2x',
                  description: 'Reading level improvement in 6 months',
                },
                {
                  stat: '85%',
                  description: 'Of parents report increased reading engagement',
                },
                {
                  stat: '3x',
                  description: 'More vocabulary words learned vs. traditional reading',
                },
              ].map((result, idx) => (
                <div key={idx} className="bg-playwize-orange/10 p-8 rounded-[3rem] border-2 border-playwize-orange/20 text-center space-y-4">
                  <div className="text-5xl font-black text-playwize-orange">{result.stat}</div>
                  <p className="text-gray-700 font-bold">{result.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8 bg-playwize-orange/10 p-12 rounded-[4rem] border-4 border-playwize-orange/20">
            <h2 className="text-4xl font-black text-gray-900">
              Start Your Child's Educational Journey
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Experience how AI Tales makes learning fun through personalized, educational stories. Start with 1 free story—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 rounded-full bg-playwize-orange hover:bg-orange-600 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/signup">
                  Try It Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-playwize-orange text-playwize-orange hover:bg-playwize-orange hover:text-white font-black text-lg min-w-[200px] min-h-[56px]"
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
              <Link href="/features/personalization" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Personalization
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/story-examples" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Story Examples
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/about" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Our Mission
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
