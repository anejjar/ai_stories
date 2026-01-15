import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Target, ShieldCheck, Users, Sparkles, Check, BookOpen } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'About AI Tales - Empowering Parents, Inspiring Children | AI Tales',
  description:
    'Learn about AI Tales: Our mission to transform bedtime into educational adventures, our commitment to child safety and privacy, and how we\'re creating the next generation of confident readers.',
  keywords: [
    'about AI Tales',
    'AI storytelling company',
    'personalized stories mission',
    'AI Tales story',
    'children\'s storytelling platform',
    'educational AI company',
  ],
  openGraph: {
    title: 'About AI Tales - Empowering Parents, Inspiring Children',
    description: 'Learn about AI Tales: Our mission to transform bedtime into educational adventures and our commitment to child safety.',
    url: 'https://ai-tales.com/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About AI Tales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About AI Tales - Empowering Parents, Inspiring Children',
    description: 'Learn about AI Tales: Our mission to transform bedtime into educational adventures.',
  },
}

export default function AboutPage() {
  return (
    <>
      <ArticleSchema
        title="About AI Tales - Empowering Parents, Inspiring Children"
        description="Learn about AI Tales: Our mission to transform bedtime into educational adventures, our commitment to child safety and privacy, and how we're creating the next generation of confident readers."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'About', url: 'https://ai-tales.com/about' },
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
              <Heart className="h-4 w-4" />
              <span>Our Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              About AI Tales <br />
              <span className="text-playwize-purple">Empowering Parents, Inspiring Children</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              AI Tales empowers parents globally to create beautiful, personalized bedtime stories starring their child. Using advanced AI (Google Gemini) and human moderation, we craft educational, safe, and engaging narratives that make every child the hero of their own adventure.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-purple flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              Transform bedtime into a world of educational adventure where children learn to read, build confidence, and develop life skills—all while having fun. We believe that when a child sees themselves as the hero of a story, their potential for learning and emotional growth becomes limitless.
            </p>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              Every story we create is designed to make reading exciting, learning natural, and bedtime special. We're committed to child safety, privacy (COPPA compliant), and educational excellence.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-orange flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900">Our Vision</h2>
            </div>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              To become the #1 AI storytelling platform for children, trusted by millions of families worldwide. We envision a future where every child has access to personalized, educational stories that spark their imagination and build their confidence.
            </p>
            <div className="grid md:grid-cols-2 gap-6 pt-4">
              {[
                '10,000+ families creating magical bedtime memories',
                'Unlimited personalized stories for every child',
                'Educational content that makes learning fun',
                'Safe, human-moderated AI technology',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-playwize-purple shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Story */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-purple flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900">How AI Tales Was Founded</h2>
            </div>
            <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed">
              <p>
                AI Tales was founded in 2024 with a simple but powerful idea: What if every child could be the hero of their own story? What if bedtime could become a magical, educational adventure instead of a daily battle?
              </p>
              <p>
                As parents ourselves, we understood the struggle of creating engaging bedtime stories every night. We also saw how children light up when they see themselves in stories. We combined these insights with cutting-edge AI technology to create something truly special.
              </p>
              <p>
                Today, AI Tales is trusted by 10,000+ families worldwide. We're proud to be creating the next generation of confident, curious readers—one personalized story at a time.
              </p>
            </div>
          </div>

          {/* Our Commitments */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Our Commitments
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Child Safety',
                  description: '100% kid-safe content with human moderation. COPPA compliant. No inappropriate content, ever.',
                  icon: ShieldCheck,
                },
                {
                  title: 'Educational Excellence',
                  description: 'Every story is designed by educators to build specific skills. Curriculum-aligned content.',
                  icon: Target,
                },
                {
                  title: 'Privacy Protection',
                  description: 'We never sell your data. Minimal collection. Parent-controlled profiles. Your child\'s privacy is protected.',
                  icon: ShieldCheck,
                },
                {
                  title: 'Quality Content',
                  description: 'Human-moderated AI ensures every story meets our high standards for safety and educational value.',
                  icon: Sparkles,
                },
                {
                  title: 'Family Focus',
                  description: 'Designed for families. Multiple children, one subscription. Quality bonding moments.',
                  icon: Users,
                },
                {
                  title: 'Continuous Improvement',
                  description: 'We listen to parent feedback and continuously improve our stories and features.',
                  icon: Heart,
                },
              ].map((commitment, idx) => (
                <div key={idx} className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
                    <commitment.icon className="h-8 w-8 text-playwize-purple" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{commitment.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed text-sm">{commitment.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Join Our Mission */}
          <div className="text-center space-y-8 bg-playwize-purple/10 p-12 rounded-[4rem] border-4 border-playwize-purple/20">
            <h2 className="text-4xl font-black text-gray-900">
              Join Our Mission
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Be part of creating the next generation of confident, curious readers. Start with 1 free story—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-playwize-purple text-playwize-purple hover:bg-playwize-purple hover:text-white font-black text-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/features" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Our Features
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/contact" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Contact
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/privacy" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/features/educational-content" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
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
