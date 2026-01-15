'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Sparkles,
  Star,
  Heart,
  Crown,
  Check,
  ArrowRight,
  Moon,
  Wand2,
  Zap,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
  Rocket,
  Users,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.push('/library')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin text-playwize-purple">
          <BookOpen className="h-12 w-12" />
        </div>
      </div>
    )
  }

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const handleUpgrade = (tier: 'pro' | 'family') => {
    router.push(`/signup?tier=${tier}`)
  }

  if (user) {
    return null
  }

  const faqs = [
    {
      q: "Are the AI-generated stories safe for my child?",
      a: "Absolutely. Safety is our top priority. We use advanced filtering and kid-safe AI models (Google Gemini) to ensure every story is wholesome, educational, and free from any inappropriate content. Every output is 100% kid-safe and privacy-respecting."
    },
    {
      q: "How does the personalized story generation work?",
      a: "It's simple! You provide your child's name, a few interests, and a moral lesson or theme you'd like to explore. Our AI then crafts a unique narrative starring your child, weaving in their personality and your chosen values in seconds."
    },
    {
      q: "What is the difference between PRO and Family Plan?",
      a: "The PRO plan offers unlimited text stories and advanced editing tools. Family Plan takes it a step further by adding magical AI-generated illustrations featuring your child, high-resolution picture-book layouts, and PDF export options for physical printing."
    },
    {
      q: "Can I try AI Stories for free?",
      a: "Yes! We offer a One-Story Free Trial so you can experience the magic instantly with zero friction. You can create, save, and read your first story without entering any credit card details."
    },
    {
      q: "Do you offer moral lessons in stories?",
      a: "Yes, our stories are designed to be both fun and educational. You can choose from themes like honesty, kindness, courage, and perseverance to help your child learn important life lessons through the power of personalized storytelling."
    }
  ]

  return (
    <main className="min-h-screen playwize-bg selection:bg-playwize-purple selection:text-white overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-50" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-50" />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200 animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="h-4 w-4" />
          <span>Magical Bedtime Stories</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-top-8 duration-700">
          Learning Made <br />
          <span className="text-playwize-purple">Fun & Engaging!</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-top-12 duration-1000">
          Discover thousands of fun and interactive bedtime stories where your child becomes the hero. 
          Safe, educational, and crafted by AI in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <Button
            onClick={handleGetStarted}
            className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all active:scale-95"
          >
            Start Your First Story
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 group cursor-pointer px-4">
            <div className="h-10 w-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm group-hover:border-playwize-purple transition-colors">
              <Sparkles className="h-5 w-5 text-playwize-purple" />
            </div>
            <span className="font-bold text-gray-700">100+ Happy Kids</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Section (Playwize Style) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Interactive Stories',
              color: 'bg-playwize-orange',
              icon: Zap,
              description: 'Stories that adapt to your child\'s choices, building decision-making skills through immersive play.'
            },
            {
              title: 'Fun Quizzes',
              color: 'bg-playwize-purple',
              icon: Star,
              description: 'Turn every story into a learning moment with educational challenges tailored to their age group.'
            },
            {
              title: 'Creative Mode',
              color: 'bg-playwize-orange',
              icon: Wand2,
              description: 'Co-create adventures with your child by mixing their wildest imagination with our safe AI magic.'
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`relative h-[480px] ${card.color} rounded-[3rem] p-10 flex flex-col justify-between overflow-hidden group shadow-xl transition-transform hover:-translate-y-2`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black text-white leading-tight">
                  {card.title}
                </h3>
                <p className="text-white/80 font-bold leading-relaxed">
                  {card.description}
                </p>
                <p className="text-white/95 font-black flex items-center gap-2 cursor-pointer group-hover:gap-3 transition-all pt-2">
                  Learn More <ArrowRight className="h-5 w-5" />
                </p>
              </div>
              <div className="relative h-48 w-full bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-sm border border-white/30">
                <card.icon className="h-24 w-24 text-white opacity-80" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section (New for SEO) */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">Our Process</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            How to Create Magical Stories <br /> In 4 Easy Steps
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Personalize", desc: "Enter your child's name and favorite things.", icon: Users },
            { step: "02", title: "Choose Theme", desc: "Select a moral lesson or a fun adventure theme.", icon: Heart },
            { step: "03", title: "AI Magic", desc: "Our AI crafts a unique, safe story in seconds.", icon: Wand2 },
            { step: "04", title: "Read Together", desc: "Enjoy a beautiful, personalized bedtime moment.", icon: BookOpen },
          ].map((item, i) => (
            <div key={i} className="space-y-6 group">
              <div className="relative inline-block">
                <div className="h-20 w-20 rounded-3xl bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-playwize-purple group-hover:border-playwize-purple transition-all duration-300">
                  <item.icon className="h-10 w-10 text-playwize-purple group-hover:text-white transition-colors" />
                </div>
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-playwize-orange text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-md">
                  {item.step}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-gray-900">{item.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Description Section (Playwize "Fun Games & Activities") */}
      <section className="max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-2 gap-16 items-center bg-white/40 rounded-[4rem] border border-white/60">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">Discover Magic</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Fun Games & Activities <br />
              for Smart Kids
            </h3>
          </div>
          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            AI Stories is more than just a reading app. It's a platform built to empower parents 
            globally to create beautiful, emotionally meaningful, and educational stories starring 
            their child—transforming bedtime into a deeply personalized ritual.
          </p>
          <ul className="space-y-4">
            {[
              'Create dynamic and interactive stories with ease',
              'Develop critical thinking, vocabulary and literacy skills',
              'Build confidence and a life-long love for reading',
              '100% Safe and educational environment for all ages'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 font-bold text-gray-700">
                <div className="h-6 w-6 rounded-full border-2 border-playwize-purple flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-playwize-purple" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <Button className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-bold text-lg shadow-lg">
            Explore All Features
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-playwize-orange rounded-[4rem] rotate-3 opacity-10" />
          <div className="relative bg-white p-6 rounded-[4rem] shadow-2xl border border-gray-100 animate-float-gentle">
            <Image
              src="/hero-bedtime.png"
              alt="Bedtime stories"
              width={600}
              height={600}
              className="w-full h-auto rounded-[3rem]"
            />
            {/* Playwize Style Badges */}
            <div className="absolute -top-6 -right-6 h-20 w-20 bg-playwize-purple rounded-3xl flex items-center justify-center shadow-xl rotate-12">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-6 -left-6 h-24 w-24 bg-playwize-orange rounded-full flex items-center justify-center shadow-xl -rotate-12 border-8 border-white">
              <Star className="h-10 w-10 text-white fill-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section (New for SEO) */}
      <section className="max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-playwize-orange/10 p-8 rounded-[3rem] border-2 border-playwize-orange/20">
                <Brain className="h-12 w-12 text-playwize-orange mb-4" />
                <h4 className="text-xl font-black text-gray-900">Brain Growth</h4>
                <p className="text-gray-500 font-bold text-sm">Boost cognitive development through active storytelling.</p>
              </div>
              <div className="bg-playwize-purple/10 p-8 rounded-[3rem] border-2 border-playwize-purple/20">
                <ShieldCheck className="h-12 w-12 text-playwize-purple mb-4" />
                <h4 className="text-xl font-black text-gray-900">Pure Safety</h4>
                <p className="text-gray-500 font-bold text-sm">Enterprise-grade moderation ensures kid-safe content.</p>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="bg-playwize-purple/10 p-8 rounded-[3rem] border-2 border-playwize-purple/20">
                <Rocket className="h-12 w-12 text-playwize-purple mb-4" />
                <h4 className="text-xl font-black text-gray-900">Limitless</h4>
                <p className="text-gray-500 font-bold text-sm">Endless possibilities for themes, morals, and worlds.</p>
              </div>
              <div className="bg-playwize-orange/10 p-8 rounded-[3rem] border-2 border-playwize-orange/20">
                <Users className="h-12 w-12 text-playwize-orange mb-4" />
                <h4 className="text-xl font-black text-gray-900">Bonding</h4>
                <p className="text-gray-500 font-bold text-sm">Create memories that last long after the lights go out.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-1 lg:order-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">Why AI Stories?</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Empowering Parents, <br /> Inspiring Children
            </h3>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              Our platform uses the latest Gemini Text API to craft personalized tales that resonate emotionally. 
              By putting your child at the center of the narrative, we boost engagement and make complex moral lessons easy to understand.
            </p>
            <p className="text-lg text-gray-600 font-medium leading-relaxed">
              With our Family Plan tier, stories come to life with high-resolution AI illustrations, 
              giving your child a visual representation of their own brave adventures.
            </p>
          </div>
          <Button variant="outline" className="h-14 px-10 rounded-full border-2 border-playwize-purple text-playwize-purple hover:bg-playwize-purple hover:text-white font-black text-lg transition-all">
            See Success Stories
          </Button>
        </div>
      </section>

      {/* Testimonials (Playwize Quote Bubbles) */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            What Parents Says <br /> About Our Program
          </h3>
        </div>

        <div className="space-y-8 max-w-3xl mx-auto">
          {[
            {
              name: 'Sarah Miller',
              role: 'Parent',
              text: 'The personalized stories have completely changed our bedtime routine. My kids are actually excited to go to sleep now! Seeing their names in the story makes them feel so special.',
            },
            {
              name: 'David Thompson',
              role: 'Early Childhood Educator',
              text: 'A brilliant use of AI for education. The stories are wholesome, safe, and genuinely engaging for children of all ages. I recommend this to every parent I know.',
            },
            {
              name: 'Jessica Lee',
              role: 'Working Parent',
              text: 'I love how easy it is to create a magical story in seconds. The illustrations are a huge plus! It\'s become the highlight of our day after a long work week.',
            },
          ].map((t, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 text-left relative group hover:shadow-xl transition-all">
              <div className="absolute top-6 right-10 flex gap-1 text-playwize-orange">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 fill-playwize-orange" />)}
              </div>
              <p className="text-lg text-gray-600 font-medium leading-relaxed pr-24 italic">
                "{t.text}"
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-playwize-purple/10 flex items-center justify-center font-black text-playwize-purple text-xl">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-black text-gray-900">{t.name}</p>
                  <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 right-10 h-12 w-12 bg-white border border-gray-50 rounded-2xl rotate-45 group-hover:shadow-xl transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section (New for SEO) */}
      <section className="max-w-4xl mx-auto px-4 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">Got Questions?</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Frequently Asked <br /> Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden cursor-pointer transition-all hover:border-playwize-purple"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="p-8 flex items-center justify-between">
                <h4 className="text-xl font-black text-gray-900 pr-8">{faq.q}</h4>
                <div className="shrink-0 h-10 w-10 rounded-full bg-playwize-purple/10 flex items-center justify-center">
                  {openFaq === i ? <ChevronUp className="h-6 w-6 text-playwize-purple" /> : <ChevronDown className="h-6 w-6 text-playwize-purple" />}
                </div>
              </div>
              {openFaq === i && (
                <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-gray-600 font-medium leading-relaxed border-t border-gray-50 pt-6">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA Banner (Playwize Style) */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-playwize-purple rounded-[4rem] p-12 md:p-20 grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="space-y-8 relative z-10">
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Discover Fun and Engaging <br />
              Learning for Kids
            </h3>
            <p className="text-white/80 font-bold text-lg max-w-md">
              Join thousands of families already creating unforgettable bedtime memories. 
              Start your free story adventure today!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleGetStarted} className="h-14 px-10 rounded-full bg-white text-playwize-purple hover:bg-gray-100 font-black text-lg">
                Get Started Free
              </Button>
              <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full bg-white/30 border-2 border-white/50" />
                  ))}
                </div>
                <span className="text-white font-bold">100+ Happy Kids</span>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="h-80 w-full bg-white/20 rounded-[3rem] backdrop-blur-md border border-white/30 flex items-center justify-center">
              <BookOpen className="h-40 w-40 text-white opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing styled for Playwize */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">Subscription</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Choose Your Adventure
          </h3>
          <p className="text-gray-500 font-bold text-lg max-w-xl mx-auto">
            Upgrade your experience to unlock unlimited magic and personalized illustrations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: 'Pro Plan',
              price: '$9.99',
              features: ['Unlimited text stories', 'Multiple drafts', 'Rewrite/Enhance tools', '25+ premium themes', 'Ad-free experience'],
              color: 'border-playwize-purple',
              btnBg: 'bg-playwize-purple',
              tier: 'pro'
            },
            {
              name: 'Family Plan',
              price: '$19.99',
              features: ['Everything in Pro', 'AI-illustrated stories', 'Child appearance customization', 'PDF export for printing', 'High-res storybooks'],
              color: 'border-playwize-orange shadow-2xl',
              btnBg: 'bg-playwize-orange',
              tier: 'family',
              popular: true
            }
          ].map((plan, i) => (
            <Card key={i} className={`p-12 rounded-[4rem] border-4 ${plan.color} relative overflow-hidden group transition-all hover:scale-[1.02]`}>
              {plan.popular && (
                <div className="absolute top-8 right-[-40px] bg-playwize-orange text-white px-12 py-2 rotate-45 font-black text-sm">
                  BEST VALUE ✨
                </div>
              )}
              <div className="space-y-8">
                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-widest">{plan.name}</h4>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <ul className="space-y-4 text-left">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 font-bold text-gray-600">
                      <Check className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleUpgrade(plan.tier as any)}
                  className={`w-full h-14 rounded-full ${plan.btnBg} text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg`}
                >
                  Unlock Magic Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SEO Footer Text (New) */}
      <section className="max-w-7xl mx-auto px-4 pb-24 text-center">
        <div className="max-w-4xl mx-auto bg-white/30 rounded-[3rem] p-12 border border-white/50">
          <h4 className="text-2xl font-black text-gray-900 mb-6">Empowering the Next Generation of Readers</h4>
          <p className="text-gray-600 font-medium leading-relaxed italic">
            "AI Stories leverages advanced Gemini 1.5 Pro and Flash technologies to provide parents with a safe, 
            creative outlet for children's imagination. We believe that when a child sees themselves as the 
            hero of a story, their potential for learning and emotional growth becomes limitless. 
            Join our mission to transform bedtime into a world of educational adventure."
          </p>
        </div>
      </section>

      {/* Footer (Playwize Style) */}
      <footer className="bg-playwize-purple/5 pt-24 pb-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-playwize-purple flex items-center justify-center shadow-lg shadow-purple-200">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-black text-gray-900">AI Stories</span>
            </Link>
            <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed">
              Creating magical bedtime memories where every child becomes the hero of their own educational adventure. 
              Safe AI stories for smart kids.
            </p>
          </div>
          
          <div className="space-y-8">
            <h5 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b-4 border-playwize-orange inline-block pb-1">Navigation</h5>
            <ul className="space-y-4">
              <li><Link href="/library" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Library</Link></li>
              <li><Link href="/discover" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Discover Stories</Link></li>
              <li><Link href="/create" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Create AI Story</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b-4 border-playwize-purple inline-block pb-1">Legal & Support</h5>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">About AI Stories</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/login" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Member Sign In</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 font-bold">© {new Date().getFullYear()} AI Stories. Personalizing childhood since 2024.</p>
          <div className="flex gap-8">
            <Zap className="h-6 w-6 text-gray-300 hover:text-playwize-purple transition-colors cursor-pointer" />
            <Sparkles className="h-6 w-6 text-gray-300 hover:text-playwize-purple transition-colors cursor-pointer" />
            <Star className="h-6 w-6 text-gray-300 hover:text-playwize-purple transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </main>
  )
}
