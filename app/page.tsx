'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Sparkles,
  Star,
  Heart,
  Check,
  ArrowRight,
  Wand2,
  Zap,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
  Rocket,
  Users,
  Lock,
  Volume2,
  Palette,
  FileText,
  TrendingUp,
  Clock,
  Globe,
  Award,
  X,
} from 'lucide-react'
import { FAQSchema, HowToSchema, ProductSchema } from '@/components/schema/schema-markup'

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

  // FAQ data for schema markup
  const faqData = [
    {
      question: "Is AI-generated content safe for my child?",
      answer: "Absolutely. Safety is our top priority. We use Google Gemini's advanced safety filters plus human moderation to ensure every story is 100% kid-safe, wholesome, and age-appropriate. Every story is reviewed before your child sees it. We're COPPA compliant and never sell your child's data."
    },
    {
      question: "How do you ensure age-appropriate stories?",
      answer: "Stories are automatically filtered by age (3-12), and our AI is trained on educational, child-appropriate content. Additionally, human moderators review stories for age-appropriateness. Parents can also set reading level preferences to ensure stories match their child's development."
    },
    {
      question: "What data do you collect about my child?",
      answer: "We only collect what's necessary for personalization: name, age, interests (optional), and reading preferences. We never sell data, never show ads, and comply with COPPA. Your child's privacy is protected. Read our full Privacy Policy for details."
    },
    {
      question: "Is there human moderation?",
      answer: "Yes. While AI generates stories quickly, human moderators review content to ensure safety, age-appropriateness, and educational value. This dual-layer approach (AI + human) ensures the highest safety standards."
    },
    {
      question: "Do I need an internet connection?",
      answer: "Yes, for story generation. However, once generated, stories can be saved and accessed offline. We're working on offline story generation for future updates."
    },
    {
      question: "What devices are supported?",
      answer: "AI Tales works on any device with a web browser: phones, tablets, computers. We're optimized for mobile, tablet, and desktop. No app download required—just visit ai-tales.com."
    },
    {
      question: "Can siblings share an account?",
      answer: "Yes! The Family Plan supports up to 3 child profiles. Each child gets personalized stories at their reading level. Perfect for families with multiple children."
    },
    {
      question: "How long does story generation take?",
      answer: "Text stories generate in 10-30 seconds. AI-illustrated stories (Family Plan) take 1-2 minutes. You'll see a progress indicator, and you can continue browsing while stories generate."
    },
    {
      question: "How personalized are the stories?",
      answer: "Very. Our AI doesn't just insert your child's name—it crafts entire narratives around their interests, personality, and reading level. If your child loves dinosaurs, the story features dinosaur adventures. If they're learning about sharing, the story teaches empathy through their heroic journey."
    },
    {
      question: "Can I preview stories before my child sees them?",
      answer: "Yes. All stories are saved to your library, and you can preview, edit, or regenerate stories before sharing with your child. You have full control."
    },
    {
      question: "What age ranges do you support?",
      answer: "Ages 3-12. Stories automatically adapt to age: simpler language and concepts for younger children, more complex narratives and vocabulary for older kids."
    },
    {
      question: "Do stories adapt as my child grows?",
      answer: "Yes. You can update your child's profile (age, interests, reading level) anytime, and new stories will reflect their current development. Stories grow with your child."
    },
    {
      question: "How is this different from free story apps?",
      answer: "Free apps often lack safety moderation, educational value, and true personalization. AI Tales offers human-moderated, curriculum-aligned, deeply personalized stories with unlimited generation. You get professional-quality content at a fraction of the cost of custom-printed books."
    },
    {
      question: "Can I try before subscribing?",
      answer: "Yes! Start with 1 free story—no credit card required. Experience the magic, then decide if you want unlimited stories with a paid plan."
    },
    {
      question: "What if my child doesn't like it?",
      answer: "We offer a 30-day money-back guarantee. If AI Tales isn't right for your family, we'll refund your subscription—no questions asked."
    },
    {
      question: "Is there a discount for teachers/schools?",
      answer: "We're working on an Educator Plan. Contact us at educators@ai-tales.com for early access and special pricing."
    },
    {
      question: "Will this actually improve my child's reading?",
      answer: "Yes. Our stories are designed by educators to build reading comprehension, vocabulary, and fluency. Many parents report reading level improvements within months. The personalization increases engagement, which is key to reading development."
    },
    {
      question: "How much time should my child spend on this?",
      answer: "We recommend 15-30 minutes per day. Stories are designed to be read in one sitting (bedtime routine), but children can re-read favorites anytime. It's quality over quantity—engaged reading for 20 minutes beats passive screen time for hours."
    },
    {
      question: "What if my child is a reluctant reader?",
      answer: "AI Tales is perfect for reluctant readers. When children see themselves as the hero, reading becomes exciting, not scary. The personalization increases motivation, and interactive elements keep them engaged. Many parents report their reluctant readers asking for more stories."
    },
    {
      question: "Can I switch plans?",
      answer: "Yes, upgrade or downgrade anytime. Your billing will be prorated, and you can change plans from your account settings."
    },
  ]

  const testimonials = [
    {
      quote: "My son's reading level improved by two grade levels in 6 months. He went from hating reading to asking for 'his story' every night. The personalization is incredible—stories about dinosaurs when he's obsessed, space adventures when he's curious. Worth every penny.",
      name: "Jennifer M.",
      role: "Mother of 7-year-old",
      location: "Austin, TX",
      rating: 5,
      result: "Reading level improved 2 grades in 6 months"
    },
    {
      quote: "Bedtime used to be a battle. Now it's our favorite time of day. My daughter actually gets excited to go to bed because she knows she'll get a new story where she's the hero. The AI understands her personality—shy but brave, curious about science. It's like having a personal storyteller who knows my child.",
      name: "David T.",
      role: "Father of 5-year-old",
      location: "Portland, OR",
      rating: 5
    },
    {
      quote: "The Family Plan is perfect for our three kids. Each gets stories at their level—my 3-year-old gets simple adventures, my 8-year-old gets complex narratives with vocabulary challenges. The AI-illustrated stories are beautiful. My kids love seeing themselves as the hero in the pictures.",
      name: "Maria S.",
      role: "Mother of 3",
      location: "Chicago, IL",
      rating: 5
    },
    {
      quote: "We tried Wonderbly, but at $40 per book, it was too expensive. AI Tales gives us unlimited personalized stories for $9.99/month. The quality is just as good, and we get new stories whenever we want. Best parenting purchase we've made.",
      name: "James L.",
      role: "Father of 6-year-old",
      location: "Denver, CO",
      rating: 5
    },
    {
      quote: "As a teacher, I'm picky about educational content. AI Tales stories are curriculum-aligned and actually teach skills. My students use it at home, and I've seen reading comprehension improve. The interactive questions are perfect for checking understanding.",
      name: "Sarah K.",
      role: "Elementary Teacher & Mother",
      location: "Boston, MA",
      rating: 5
    },
    {
      quote: "My daughter was a reluctant reader. Nothing worked—not books, not apps, not bribery. AI Tales changed everything. When she saw herself as the hero, she wanted to read. Now she's reading above grade level and asking for more stories. It's been transformative.",
      name: "Michael R.",
      role: "Father of 8-year-old",
      location: "Seattle, WA",
      rating: 5
    }
  ]

  // HowTo schema for "How It Works" section
  const howToSteps = [
    {
      name: "Tell Us About Your Child",
      text: "Enter name, age, interests, personality traits. Choose reading level (optional)."
    },
    {
      name: "Choose Story Theme & Values",
      text: "Select from 25+ themes (adventure, kindness, courage, STEM, etc.). Pick a moral lesson or learning objective."
    },
    {
      name: "AI Generates Your Story",
      text: "Watch the AI craft a unique narrative. Real-time generation progress."
    },
    {
      name: "Read, Learn, and Bond Together",
      text: "Beautiful story interface with interactive elements and questions. Save to library for re-reading."
    }
  ]

  return (
    <>
      <FAQSchema questions={faqData.map(f => ({ question: f.question, answer: f.answer }))} />
      <HowToSchema 
        name="How to Create Personalized Stories for Your Child"
        description="Learn how to create personalized bedtime stories for your child in 4 simple steps using AI Tales."
        steps={howToSteps}
      />
      <ProductSchema 
        name="AI Tales Pro Plan"
        description="Unlimited personalized AI stories for children"
        price="9.99"
      />
      <ProductSchema 
        name="AI Tales Family Plan"
        description="AI-illustrated personalized stories for multiple children"
        price="19.99"
      />
      <main className="min-h-screen playwize-bg selection:bg-playwize-purple selection:text-white overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-50" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-50" />
        
        {/* Section 1: Hero Section */}
        <section className="relative pt-24 pb-16 px-4 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200 animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="h-4 w-4" />
            <span>Magical Bedtime Stories</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-top-8 duration-700">
            AI Story Generator for Kids: <br />
            <span className="text-playwize-purple">Personalized Bedtime Stories in Seconds</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-top-12 duration-1000">
            Watch your child become the hero of unlimited educational adventures. Safe, AI-powered stories that make reading fun—starting with 1 free story, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <Button
              onClick={handleGetStarted}
              className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all active:scale-95 min-w-[200px] min-h-[56px]"
            >
              Start Your Free Story
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 group cursor-pointer px-4">
              <div className="h-10 w-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm group-hover:border-playwize-purple transition-colors">
                <Sparkles className="h-5 w-5 text-playwize-purple" />
              </div>
              <span className="font-bold text-gray-700">Join 10,000+ families creating magical bedtime memories</span>
            </div>
          </div>
        </section>

        {/* Section 2: Trust Bar / Social Proof */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-gray-600">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-playwize-purple" />
              <span>10,000+ Stories Created Daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-playwize-orange fill-playwize-orange" />
              <span>4.9/5 ⭐ from 2,000+ Parents</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-playwize-purple" />
              <span>COPPA Compliant • Human-Moderated • 100% Kid-Safe</span>
            </div>
          </div>
        </section>

        {/* Section 3: Problem Agitation */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Tired of Bedtime Battles and Passive Screen Time?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h3 className="text-2xl font-black text-gray-900">Generic Stories Don't Engage</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  Your child zones out on the same old fairy tales. They've heard Cinderella a hundred times—where's the magic?
                </p>
              </div>
              
              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h3 className="text-2xl font-black text-gray-900">Passive Screen Time Guilt</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  You want educational content, but YouTube feels like a compromise. How do you make screen time count without the guilt?
                </p>
              </div>
              
              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h3 className="text-2xl font-black text-gray-900">Exhausted Parents, Limited Time</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  You're too tired to create engaging stories every night. But you want bedtime to be special, not rushed.
                </p>
              </div>
              
              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h3 className="text-2xl font-black text-gray-900">Reading Struggles</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  Your child is a reluctant reader, and you're running out of ideas. How do you build reading confidence without the pressure?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Solution Overview */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              AI Tales: Where Every Child Becomes the Hero of Their Own Story
            </h2>
            
            <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed">
              <p>
                Imagine bedtime stories where your child isn't just listening—they're the brave knight, the curious explorer, the kind friend. AI Tales uses advanced AI (Google Gemini) to create truly personalized stories that adapt to your child's interests, reading level, and the values you want to teach.
              </p>
              <p>
                Every story is unique. Every story is educational. Every story is safe—human-moderated and COPPA compliant. And every story makes your child the star.
              </p>
              <p>
                No more generic fairy tales. No more passive screen time. Just magical, personalized adventures that build reading skills, teach life lessons, and create bedtime memories your family will treasure.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Features Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">Features</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Everything Your Child Needs for Magical Adventures
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: True AI Personalization */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-playwize-purple" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Personalized Children's Stories That Actually Feel Personal</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Not just dropping your child's name into a template. Our AI crafts entire narratives around your child's interests, personality traits, and learning level. When Emma loves dinosaurs, her story features a T-Rex adventure. When Jake struggles with sharing, his story teaches empathy through his own heroic journey. <Link href="/features/personalization" className="text-playwize-purple font-bold hover:underline">Learn more about our personalization features</Link>.
              </p>
            </div>

            {/* Feature 2: Educational Integration */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-playwize-orange" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Educational Storytelling That Doesn't Feel Like Homework</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Every story is designed by educators to build specific skills—vocabulary, reading comprehension, emotional intelligence, STEM concepts. Your child learns without realizing they're learning. Reading becomes play, not work. <Link href="/features/educational-content" className="text-playwize-purple font-bold hover:underline">See our educational approach</Link>.
              </p>
            </div>

            {/* Feature 3: Unlimited AI Story Generation */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-playwize-purple" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Unlimited AI Story Generator for Kids—Never Run Out of Adventures</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Unlike expensive personalized books ($40+ each), AI Tales gives you unlimited stories for $9.99/month. Bedtime battles? Solved. Long car rides? Entertained. Reluctant reader? Motivated. Every day brings a new adventure.
              </p>
            </div>

            {/* Feature 4: Interactive Learning Elements */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-playwize-orange" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Interactive Stories for Kids That Build Critical Thinking</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Our stories include comprehension questions, choice-driven narratives, and creative prompts. Your child isn't just reading—they're thinking, deciding, and creating. Active engagement, not passive consumption.
              </p>
            </div>

            {/* Feature 5: Age-Appropriate Safety */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-playwize-purple" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Safe AI Content for Children—Human-Moderated & COPPA Compliant</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                We use Google's safety filters plus human moderation to ensure every story is 100% kid-safe. No inappropriate content. No data selling. No ads. Just wholesome, educational stories you can trust.
              </p>
            </div>

            {/* Feature 6: Family Plan Benefits */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-playwize-orange" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Family Storytelling App for Multiple Children</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                The Family Plan supports up to 3 child profiles, each with personalized stories. Siblings can have different adventures while you manage everything from one dashboard. Perfect for families with multiple kids.
              </p>
            </div>

            {/* Feature 7: AI-Illustrated Stories */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
                <Palette className="h-8 w-8 text-playwize-purple" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">AI-Illustrated Picture Books Featuring Your Child</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Family Plan subscribers get AI-generated illustrations where your child appears as the hero. High-resolution picture books that rival expensive custom-printed books—but unlimited and instant.
              </p>
            </div>

            {/* Feature 8: Text-to-Speech & Audio */}
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-playwize-orange" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Bedtime Story Audio for Hands-Free Reading</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Let AI Tales read the story while you cuddle. Perfect for exhausted parents or when you want to listen together. Professional narration that brings stories to life.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: How It Works */}
        <section className="max-w-7xl mx-auto px-4 py-24 text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">How It Works</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              How to Create Personalized Stories for Your Child in 4 Simple Steps
            </h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                step: "01", 
                title: "Tell Us About Your Child", 
                desc: "Enter name, age, interests, personality traits. Choose reading level (optional).", 
                icon: Users,
                time: "30 seconds"
              },
              { 
                step: "02", 
                title: "Choose Story Theme & Values", 
                desc: "Select from 25+ themes (adventure, kindness, courage, STEM, etc.). Pick a moral lesson or learning objective.", 
                icon: Heart,
                time: "20 seconds"
              },
              { 
                step: "03", 
                title: "AI Generates Your Story", 
                desc: "Watch the AI craft a unique narrative. Real-time generation progress.", 
                icon: Wand2,
                time: "10-30 seconds"
              },
              { 
                step: "04", 
                title: "Read, Learn, and Bond Together", 
                desc: "Beautiful story interface with interactive elements and questions. Save to library for re-reading.", 
                icon: BookOpen,
                time: "Unlimited"
              },
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
                  <p className="text-sm text-playwize-purple font-bold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Use Cases / Scenarios */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">Use Cases</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Perfect For Every Family Situation
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                headline: "From Bedtime Battles to Story Requests",
                content: "Sarah's 5-year-old used to fight bedtime. Now, she asks for 'her story' every night. The personalized adventures make her feel special, and the routine has become our favorite part of the day.",
                keyword: "bedtime story generator"
              },
              {
                headline: "When They're the Hero, They Want to Read",
                content: "Marcus struggled with reading confidence. Seeing himself as the brave explorer in AI Tales stories changed everything. He's now reading above grade level and asking for more stories.",
                keyword: "help child love reading"
              },
              {
                headline: "Homeschool Support That Feels Like Playtime",
                content: "As a homeschooling parent, I use AI Tales to reinforce lessons. When we study space, my kids get personalized astronaut adventures. Learning becomes an adventure, not a chore.",
                keyword: "educational storytelling for homeschool"
              },
              {
                headline: "Interactive Stories vs. Passive Videos",
                content: "Instead of YouTube, my kids read AI Tales stories. They're actively engaged, building reading skills, and I feel good about their screen time. It's educational entertainment I can trust.",
                keyword: "educational screen time"
              },
              {
                headline: "Entertainment That Enriches",
                content: "Road trips used to mean tablet time. Now, my kids listen to AI Tales stories in the car. They're entertained, learning, and we have great conversations about the stories afterward."
              },
              {
                headline: "Stories That Teach Social-Emotional Skills",
                content: "My daughter was shy. Through AI Tales stories where she's the confident leader, she's learned to see herself differently. The stories teach empathy, courage, and problem-solving through her own adventures."
              }
            ].map((scenario, i) => (
              <div key={i} className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h4 className="text-xl font-black text-gray-900">{scenario.headline}</h4>
                <p className="text-gray-600 font-medium leading-relaxed">{scenario.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Benefits (Parent + Child Perspectives) */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">Benefits</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Empowering Parents, Inspiring Children
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column: For Parents */}
            <div className="space-y-6">
              <h3 className="text-3xl font-black text-gray-900">For Parents</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Time-Saving Magic",
                    desc: "Create engaging stories in seconds, not hours. No more exhausted bedtime routines."
                  },
                  {
                    title: "Educational Confidence",
                    desc: "Feel good about screen time. Every story builds reading skills and teaches values."
                  },
                  {
                    title: "Quality Bonding Moments",
                    desc: "Bedtime becomes special again. Create memories that last long after the lights go out."
                  },
                  {
                    title: "Guilt-Free Screen Time",
                    desc: "Active reading, not passive watching. Screen time you can feel good about."
                  },
                  {
                    title: "Literacy Development",
                    desc: "Watch reading skills improve naturally. Stories adapt to your child's learning level. View story examples to see the magic."
                  },
                  {
                    title: "Value for Money",
                    desc: "Unlimited stories for less than one custom-printed book. Best investment in your child's education."
                  },
                  {
                    title: "Flexible for Multiple Kids",
                    desc: "Family Plan supports 3 children. Each gets personalized stories at their level."
                  }
                ].map((benefit, i) => (
                  <div key={i} className="bg-white/60 p-6 rounded-[2rem] border-2 border-gray-100">
                    <h4 className="text-xl font-black text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 font-medium">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: For Children */}
            <div className="space-y-6">
              <h3 className="text-3xl font-black text-gray-900">For Children</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "See Themselves as Heroes",
                    desc: "Every story stars them. They're the brave knight, the curious scientist, the kind friend."
                  },
                  {
                    title: "Stories Match Their Interests",
                    desc: "Dinosaurs? Space? Princesses? Their favorite things become epic adventures."
                  },
                  {
                    title: "Builds Reading Confidence",
                    desc: "When they're the hero, reading feels exciting, not scary. Confidence grows with every story."
                  },
                  {
                    title: "Sparks Creativity",
                    desc: "Interactive elements let them make choices. They're not just reading—they're creating."
                  },
                  {
                    title: "Makes Learning Fun",
                    desc: "Educational content disguised as adventure. They learn without realizing it."
                  },
                  {
                    title: "Age-Appropriate Challenges",
                    desc: "Stories adapt to their reading level. Always engaging, never frustrating."
                  },
                  {
                    title: "Beautiful Illustrations (Family Plan)",
                    desc: "See themselves as the hero in AI-generated picture books. Magical and memorable."
                  }
                ].map((benefit, i) => (
                  <div key={i} className="bg-white/60 p-6 rounded-[2rem] border-2 border-gray-100">
                    <h4 className="text-xl font-black text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 font-medium">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Social Proof (Extended Testimonials) */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">Testimonials</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Join 10,000+ Families Creating Magical Bedtime Memories
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 text-left relative group hover:shadow-xl transition-all">
                <div className="absolute top-6 right-10 flex gap-1 text-playwize-orange">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-5 w-5 fill-playwize-orange" />)}
                </div>
                <p className="text-lg text-gray-600 font-medium leading-relaxed pr-24 italic mb-6">
                  "{t.quote}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-playwize-purple/10 flex items-center justify-center font-black text-playwize-purple text-xl">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{t.name}</p>
                    <p className="text-gray-500 font-bold text-sm">{t.role}</p>
                    <p className="text-gray-400 font-medium text-xs">{t.location}</p>
                    {t.result && (
                      <p className="text-playwize-purple font-bold text-xs mt-1">{t.result}</p>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-4 right-10 h-12 w-12 bg-white border border-gray-50 rounded-2xl rotate-45 group-hover:shadow-xl transition-all" />
              </div>
            ))}
          </div>
        </section>

        {/* Section 10: Comparison Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">Comparison</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Why AI Tales Beats the Alternatives
            </h3>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-[3rem] border-2 border-gray-100 overflow-hidden">
              <thead>
                <tr className="bg-playwize-purple/10">
                  <th className="p-6 text-left font-black text-gray-900">Feature</th>
                  <th className="p-6 text-center font-black text-playwize-purple">AI Tales</th>
                  <th className="p-6 text-center font-black text-gray-700">Wonderbly</th>
                  <th className="p-6 text-center font-black text-gray-700">Epic!</th>
                  <th className="p-6 text-center font-black text-gray-700">StoryBots</th>
                  <th className="p-6 text-center font-black text-gray-700">Generic AI Apps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "True Personalization", aiTales: "✓ Deep AI", others: ["✗ Template", "✗ Generic", "✗ Limited", "✗ Basic"] },
                  { feature: "Unlimited Stories", aiTales: "✓ Unlimited", others: ["✗ $40+ each", "✓ Library", "✓ Limited", "✗ Limited"] },
                  { feature: "Educational Value", aiTales: "✓ Curriculum-aligned", others: ["✗ Entertainment", "✓ Educational", "✓ Educational", "✗ Varies"] },
                  { feature: "Interactive Elements", aiTales: "✓ Yes", others: ["✗ No", "✗ Passive", "✓ Some", "✗ Rare"] },
                  { feature: "AI Illustrations", aiTales: "✓ Family Plan", others: ["✗ Physical only", "✗ No", "✗ No", "✗ Rare"] },
                  { feature: "Safety & Moderation", aiTales: "✓ Human-moderated", others: ["✓ Safe", "✓ Safe", "✓ Safe", "✗ Often unmoderated"] },
                  { feature: "Price", aiTales: "$9.99-$19.99/mo", others: ["$40+ per book", "$9.99/mo", "$4.99/mo", "Varies"] },
                  { feature: "Reading Skill Building", aiTales: "✓ Adaptive", others: ["✗ No", "✓ Yes", "✓ Some", "✗ No"] },
                  { feature: "Child as Hero", aiTales: "✓ Always", others: ["✓ Sometimes", "✗ No", "✓ Sometimes", "✗ Rare"] },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-6 font-bold text-gray-900">{row.feature}</td>
                    <td className="p-6 text-center font-black text-playwize-purple">{row.aiTales}</td>
                    {row.others.map((other, j) => (
                      <td key={j} className="p-6 text-center text-gray-600 font-medium">{other}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alternative Format Sections */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <h4 className="text-2xl font-black text-gray-900">Why Choose AI Tales Over Wonderbly?</h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                Wonderbly: $40+ per physical book, one-time purchase. AI Tales: Unlimited digital stories for $9.99/month. Wonderbly: Template-based personalization. AI Tales: Deep AI personalization that adapts to interests.
              </p>
            </div>
            
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <h4 className="text-2xl font-black text-gray-900">Why Choose AI Tales Over Epic!?</h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                Epic!: Generic library content, not personalized. AI Tales: Every story features your child as the hero. Epic!: Passive consumption. AI Tales: Interactive, educational, engaging.
              </p>
            </div>
            
            <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
              <h4 className="text-2xl font-black text-gray-900">Why Choose AI Tales Over Free AI Apps?</h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                Free apps: Often unmoderated, safety concerns. AI Tales: Human-moderated, COPPA compliant, 100% kid-safe. Free apps: Low educational value. AI Tales: Curriculum-aligned, builds reading skills.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11: Pricing Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">Pricing</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Simple, Transparent Pricing—No Hidden Fees
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Trial */}
            <Card className="p-12 rounded-[4rem] border-4 border-gray-200 relative overflow-hidden group transition-all hover:scale-[1.02]">
              <div className="space-y-8">
                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Free Trial</h4>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-black text-gray-900">$0</span>
                  <span className="text-gray-500 font-bold">/forever</span>
                </div>
                <ul className="space-y-4 text-left">
                  {[
                    '1 free story generation',
                    'Save & view your story',
                    '100% kid-safe content',
                    'Personalized with child\'s name'
                  ].map((f, j) => (
                    <li key={j} className="flex items-start gap-3 font-bold text-gray-600">
                      <Check className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full h-14 rounded-full bg-playwize-purple text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg min-h-[56px]"
                >
                  Start Free Trial →
                </Button>
                <p className="text-center text-sm font-bold text-gray-500">No credit card required</p>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="p-12 rounded-[4rem] border-4 border-playwize-purple relative overflow-hidden group transition-all hover:scale-[1.02]">
              <div className="space-y-8">
                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Pro Plan</h4>
                <p className="text-sm font-bold text-gray-500">Perfect for One Child</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-black text-gray-900">$9.99</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-xs text-gray-500 text-center">or $99/year - save 17%</p>
                <ul className="space-y-4 text-left">
                  {[
                    'Unlimited text stories',
                    'Multiple story drafts (3 per request)',
                    'Rewrite & enhance tools',
                    '25+ story themes',
                    '10 story templates',
                    'Text-to-Speech audio',
                    'Unlimited storage',
                    'Ad-free experience'
                  ].map((f, j) => (
                    <li key={j} className="flex items-start gap-3 font-bold text-gray-600">
                      <Check className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleUpgrade('pro')}
                  className="w-full h-14 rounded-full bg-playwize-purple text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg min-h-[56px]"
                >
                  Start Pro Plan →
                </Button>
                <p className="text-center text-sm font-bold text-gray-500">Unlimited stories for less than one custom-printed book</p>
              </div>
            </Card>

            {/* Family Plan */}
            <Card className="p-12 rounded-[4rem] border-4 border-playwize-orange shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.02]">
              <div className="absolute top-8 right-[-40px] bg-playwize-orange text-white px-12 py-2 rotate-45 font-black text-sm">
                BEST VALUE ✨
              </div>
              <div className="space-y-8">
                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Family Plan</h4>
                <p className="text-sm font-bold text-gray-500">Perfect for Families with 2+ Kids</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-black text-gray-900">$19.99</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-xs text-gray-500 text-center">or $199/year - save 17%</p>
                <ul className="space-y-4 text-left">
                  {[
                    'Everything in Pro',
                    'Up to 3 child profiles',
                    '2 AI-illustrated stories per day',
                    '10 text stories per day',
                    'High-resolution picture books',
                    'Child appearance customization',
                    'PDF export (coming soon)',
                    'Advanced art styles',
                    'Family dashboard'
                  ].map((f, j) => (
                    <li key={j} className="flex items-start gap-3 font-bold text-gray-600">
                      <Check className="h-5 w-5 text-playwize-orange shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleUpgrade('family')}
                  className="w-full h-14 rounded-full bg-playwize-orange text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg min-h-[56px]"
                >
                  Start Family Plan →
                </Button>
                <p className="text-center text-sm font-bold text-gray-500">AI-illustrated stories for less than one Wonderbly book per month</p>
              </div>
            </Card>
          </div>

          {/* Pricing FAQ */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/60 p-6 rounded-[2rem] border-2 border-gray-100">
              <h4 className="font-black text-gray-900 mb-2">Can I switch plans?</h4>
              <p className="text-gray-600 font-medium text-sm">Yes, upgrade or downgrade anytime. Your billing will be prorated.</p>
            </div>
            <div className="bg-white/60 p-6 rounded-[2rem] border-2 border-gray-100">
              <h4 className="font-black text-gray-900 mb-2">What happens after trial?</h4>
              <p className="text-gray-600 font-medium text-sm">Choose a plan or keep your free story. No pressure, no credit card required.</p>
            </div>
            <div className="bg-white/60 p-6 rounded-[2rem] border-2 border-gray-100">
              <h4 className="font-black text-gray-900 mb-2">Is there a refund policy?</h4>
              <p className="text-gray-600 font-medium text-sm">30-day money-back guarantee. If AI Tales isn't right for your family, we'll refund your subscription.</p>
            </div>
            <div className="bg-white/60 p-6 rounded-[2rem] border-2 border-gray-100">
              <h4 className="font-black text-gray-900 mb-2">Can I try Family Plan features?</h4>
              <p className="text-gray-600 font-medium text-sm">Upgrade anytime during trial. Your billing will be prorated from the upgrade date.</p>
            </div>
          </div>
        </section>

        {/* Section 12: Blog Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-purple font-black uppercase tracking-widest text-sm">From Our Blog</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Parenting Tips & Bedtime Wisdom
            </h3>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Expert advice on bedtime routines, reading development, and creating magical moments with your kids.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "How to Build a Perfect Bedtime Routine",
                description: "Create a calming bedtime routine that helps your child fall asleep faster and sleep better.",
                category: "Parenting Tips",
                slug: "bedtime-routine-guide-for-kids",
                color: "bg-playwize-purple"
              },
              {
                title: "Why Personalized Stories Help Reluctant Readers",
                description: "Discover science-backed strategies to turn reluctant readers into book lovers.",
                category: "Reading & Education",
                slug: "helping-reluctant-readers",
                color: "bg-playwize-orange"
              },
              {
                title: "Screen Time for Kids: Making It Educational",
                description: "Transform your child's screen time into a learning opportunity with these strategies.",
                category: "Parenting Tips",
                slug: "educational-screen-time-for-kids",
                color: "bg-green-500"
              }
            ].map((post, index) => (
              <Link
                key={index}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-[2.5rem] border-4 border-gray-100 shadow-sm hover:shadow-2xl hover:border-purple-100 transition-all hover:-translate-y-2 group overflow-hidden"
              >
                <div className={`h-2 w-full ${post.color}`} />
                <div className="p-8 space-y-5">
                  <span className="inline-block bg-purple-50 text-playwize-purple font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h4 className="text-xl font-black text-gray-900 leading-snug group-hover:text-playwize-purple transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-playwize-purple font-black text-xs uppercase tracking-wider pt-2 group-hover:gap-3 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline" className="h-14 px-10 rounded-full border-2 border-gray-200 hover:border-playwize-purple font-black text-lg">
                View All Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Section 13: FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 py-24 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-playwize-orange font-black uppercase tracking-widest text-sm">FAQ</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden cursor-pointer transition-all hover:border-playwize-purple"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="p-8 flex items-center justify-between">
                  <h4 className="text-xl font-black text-gray-900 pr-8">{faq.question}</h4>
                  <div className="shrink-0 h-10 w-10 rounded-full bg-playwize-purple/10 flex items-center justify-center min-w-[48px] min-h-[48px]">
                    {openFaq === i ? <ChevronUp className="h-6 w-6 text-playwize-purple" /> : <ChevronDown className="h-6 w-6 text-playwize-purple" />}
                  </div>
                </div>
                {openFaq === i && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-600 font-medium leading-relaxed border-t border-gray-50 pt-6">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 13: Final CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-playwize-purple rounded-[4rem] p-12 md:p-20 grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="space-y-8 relative z-10">
              <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Ready to Transform Bedtime Into Magic?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white font-bold">
                  <Check className="h-6 w-6" />
                  <span>Unlimited personalized stories</span>
                </div>
                <div className="flex items-center gap-3 text-white font-bold">
                  <Check className="h-6 w-6" />
                  <span>Safe, educational, human-moderated</span>
                </div>
                <div className="flex items-center gap-3 text-white font-bold">
                  <Check className="h-6 w-6" />
                  <span>Your child as the hero, every time</span>
                </div>
                <div className="flex items-center gap-3 text-white font-bold">
                  <Check className="h-6 w-6" />
                  <span>Start free, no credit card required</span>
                </div>
                <div className="flex items-center gap-3 text-white font-bold">
                  <Check className="h-6 w-6" />
                  <span>Cancel anytime</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleGetStarted} 
                  className="h-14 px-10 rounded-full bg-white text-playwize-purple hover:bg-gray-100 font-black text-lg min-w-[200px] min-h-[56px]"
                >
                  Start Your Free Story →
                </Button>
                <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-white/30 border-2 border-white/50" />
                    ))}
                  </div>
                  <span className="text-white font-bold">2,000+ 5-star reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-white/80 font-bold text-sm">
                <span>30-day money-back guarantee</span>
                <span>•</span>
                <span>No credit card for free trial</span>
                <span>•</span>
                <span>Cancel anytime, no questions asked</span>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="h-80 w-full bg-white/20 rounded-[3rem] backdrop-blur-md border border-white/30 flex items-center justify-center">
                <BookOpen className="h-40 w-40 text-white opacity-50" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 14: Footer */}
        <footer className="bg-playwize-purple/5 pt-24 pb-12 px-4 border-t border-gray-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-playwize-purple flex items-center justify-center shadow-lg shadow-purple-200">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-black text-gray-900">AI Tales</span>
              </Link>
              <div className="space-y-4">
                <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed">
                  AI Tales empowers parents globally to create beautiful, personalized bedtime stories starring their child. Using advanced AI (Google Gemini) and human moderation, we craft educational, safe, and engaging narratives that make every child the hero of their own adventure.
                </p>
                <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed">
                  Our mission: Transform bedtime into a world of educational adventure where children learn to read, build confidence, and develop life skills—all while having fun. We're committed to child safety, privacy (COPPA compliant), and educational excellence.
                </p>
                <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed">
                  Founded in 2024, AI Tales is trusted by 10,000+ families worldwide. Join us in creating the next generation of confident, curious readers.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-100">
                  <ShieldCheck className="h-5 w-5 text-playwize-purple" />
                  <span className="text-sm font-bold text-gray-700">COPPA Compliant</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-100">
                  <Lock className="h-5 w-5 text-playwize-purple" />
                  <span className="text-sm font-bold text-gray-700">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-100">
                  <Award className="h-5 w-5 text-playwize-purple" />
                  <span className="text-sm font-bold text-gray-700">Human-Moderated</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h5 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b-4 border-playwize-orange inline-block pb-1">Product</h5>
              <ul className="space-y-4">
                <li><Link href="/features" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Pricing</Link></li>
                <li><Link href="/how-it-works" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">How It Works</Link></li>
                <li><Link href="/story-examples" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Story Examples</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h5 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b-4 border-playwize-purple inline-block pb-1">Company</h5>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">About AI Tales</Link></li>
                <li><Link href="/blog" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Terms of Service</Link></li>
                <li><Link href="/support" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-24 pt-12 border-t-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 font-bold">© {new Date().getFullYear()} AI Tales. All rights reserved.</p>
            <div className="flex gap-8">
              <Zap className="h-6 w-6 text-gray-300 hover:text-playwize-purple transition-colors cursor-pointer" />
              <Sparkles className="h-6 w-6 text-gray-300 hover:text-playwize-purple transition-colors cursor-pointer" />
              <Star className="h-6 w-6 text-gray-300 hover:text-playwize-purple transition-colors cursor-pointer" />
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
