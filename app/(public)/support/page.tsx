'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, ShieldCheck, HelpCircle, CreditCard, BookOpen, Sparkles } from 'lucide-react'
import { FAQSchema, ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

// Note: Metadata export needs to be in a separate file or use generateMetadata function
// For now, we'll handle SEO in the component

const faqCategories = [
  {
    id: 'safety',
    title: 'Safety & Trust',
    icon: ShieldCheck,
    color: 'bg-green-100 text-green-600',
    questions: [
      {
        q: "Is AI-generated content safe for my child?",
        a: "Absolutely. Safety is our top priority. We use Google Gemini's advanced safety filters plus human moderation to ensure every story is 100% kid-safe, wholesome, and age-appropriate. Every story is reviewed before your child sees it. We're COPPA compliant and never sell your child's data."
      },
      {
        q: "How do you ensure age-appropriate stories?",
        a: "Stories are automatically filtered by age (3-12), and our AI is trained on educational, child-appropriate content. Additionally, human moderators review stories for age-appropriateness. Parents can also set reading level preferences to ensure stories match their child's development."
      },
      {
        q: "What data do you collect about my child?",
        a: "We only collect what's necessary for personalization: name, age, interests (optional), and reading preferences. We never sell data, never show ads, and comply with COPPA. Your child's privacy is protected. Read our full Privacy Policy for details."
      },
      {
        q: "Is there human moderation?",
        a: "Yes. While AI generates stories quickly, human moderators review content to ensure safety, age-appropriateness, and educational value. This dual-layer approach (AI + human) ensures the highest safety standards."
      },
    ]
  },
  {
    id: 'technical',
    title: 'Technical & Usage',
    icon: HelpCircle,
    color: 'bg-blue-100 text-blue-600',
    questions: [
      {
        q: "Do I need an internet connection?",
        a: "Yes, for story generation. However, once generated, stories can be saved and accessed offline. We're working on offline story generation for future updates."
      },
      {
        q: "What devices are supported?",
        a: "AI Tales works on any device with a web browser: phones, tablets, computers. We're optimized for mobile, tablet, and desktop. No app download required—just visit ai-tales.com."
      },
      {
        q: "Can siblings share an account?",
        a: "Yes! The Family Plan supports up to 3 child profiles. Each child gets personalized stories at their reading level. Perfect for families with multiple children."
      },
      {
        q: "How long does story generation take?",
        a: "Text stories generate in 10-30 seconds. AI-illustrated stories (Family Plan) take 1-2 minutes. You'll see a progress indicator, and you can continue browsing while stories generate."
      },
    ]
  },
  {
    id: 'content',
    title: 'Content & Personalization',
    icon: BookOpen,
    color: 'bg-purple-100 text-playwize-purple',
    questions: [
      {
        q: "How personalized are the stories?",
        a: "Very. Our AI doesn't just insert your child's name—it crafts entire narratives around their interests, personality, and reading level. If your child loves dinosaurs, the story features dinosaur adventures. If they're learning about sharing, the story teaches empathy through their heroic journey."
      },
      {
        q: "Can I preview stories before my child sees them?",
        a: "Yes. All stories are saved to your library, and you can preview, edit, or regenerate stories before sharing with your child. You have full control."
      },
      {
        q: "What age ranges do you support?",
        a: "Ages 3-12. Stories automatically adapt to age: simpler language and concepts for younger children, more complex narratives and vocabulary for older kids."
      },
      {
        q: "Do stories adapt as my child grows?",
        a: "Yes. You can update your child's profile (age, interests, reading level) anytime, and new stories will reflect their current development. Stories grow with your child."
      },
    ]
  },
  {
    id: 'pricing',
    title: 'Value & Pricing',
    icon: CreditCard,
    color: 'bg-orange-100 text-playwize-orange',
    questions: [
      {
        q: "How is this different from free story apps?",
        a: "Free apps often lack safety moderation, educational value, and true personalization. AI Tales offers human-moderated, curriculum-aligned, deeply personalized stories with unlimited generation. You get professional-quality content at a fraction of the cost of custom-printed books."
      },
      {
        q: "Can I try before subscribing?",
        a: "Yes! Start with 1 free story—no credit card required. Experience the magic, then decide if you want unlimited stories with a paid plan."
      },
      {
        q: "What if my child doesn't like it?",
        a: "We offer a 30-day money-back guarantee. If AI Tales isn't right for your family, we'll refund your subscription—no questions asked."
      },
      {
        q: "Is there a discount for teachers/schools?",
        a: "We're working on an Educator Plan. Contact us at educators@ai-tales.com for early access and special pricing."
      },
      {
        q: "Can I switch plans?",
        a: "Yes, upgrade or downgrade anytime. Your billing will be prorated, and you can change plans from your account settings."
      },
    ]
  },
  {
    id: 'results',
    title: 'Results & Outcomes',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-600',
    questions: [
      {
        q: "Will this actually improve my child's reading?",
        a: "Yes. Our stories are designed by educators to build reading comprehension, vocabulary, and fluency. Many parents report reading level improvements within months. The personalization increases engagement, which is key to reading development."
      },
      {
        q: "How much time should my child spend on this?",
        a: "We recommend 15-30 minutes per day. Stories are designed to be read in one sitting (bedtime routine), but children can re-read favorites anytime. It's quality over quantity—engaged reading for 20 minutes beats passive screen time for hours."
      },
      {
        q: "What if my child is a reluctant reader?",
        a: "AI Tales is perfect for reluctant readers. When children see themselves as the hero, reading becomes exciting, not scary. The personalization increases motivation, and interactive elements keep them engaged. Many parents report their reluctant readers asking for more stories."
      },
    ]
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  // Flatten all FAQs for schema
  const allFAQs = faqCategories.flatMap(cat => 
    cat.questions.map(q => ({ question: q.q, answer: q.a }))
  )

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0)

  return (
    <>
      <FAQSchema questions={allFAQs} />
      <ArticleSchema
        title="Help Center - Get Support for AI Tales"
        description="Get support for AI Tales. Browse FAQs, find answers about safety, technical issues, content, pricing, and results. Contact support if you need additional help."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Help Center', url: 'https://ai-tales.com/support' },
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
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Help Center <br />
              <span className="text-playwize-purple">Get Support for AI Tales</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Find answers to common questions about AI Tales. Browse FAQs by category or search for specific topics. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* Search */}
          <div className="bg-white/60 p-8 rounded-[3rem] border-4 border-gray-100">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-5 rounded-2xl border-2 border-gray-100 focus:border-playwize-purple focus:outline-none font-bold text-gray-900"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 font-bold mt-4">
                Found {filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0)} results
              </p>
            )}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white/60 rounded-[3rem] border-4 border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenCategory(openCategory === category.id ? null : category.id)}
                  className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-7 w-7" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-black text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-500 font-bold">{category.questions.length} questions</p>
                    </div>
                  </div>
                  {openCategory === category.id ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                
                {openCategory === category.id && (
                  <div className="px-8 pb-8 space-y-4 border-t border-gray-100 pt-6">
                    {category.questions.map((faq, idx) => (
                      <div key={idx} className="space-y-3">
                        <button
                          onClick={() => setOpenQuestion(openQuestion === idx ? null : idx)}
                          className="w-full text-left flex items-center justify-between p-4 bg-gray-50 rounded-[2rem] hover:bg-gray-100 transition-colors"
                        >
                          <h3 className="text-lg font-black text-gray-900 pr-8">{faq.q}</h3>
                          {openQuestion === idx ? (
                            <ChevronUp className="h-5 w-5 text-playwize-purple shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                          )}
                        </button>
                        {openQuestion === idx && (
                          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Popular Articles */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-3xl font-black text-gray-900 text-center">
              Popular Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Getting Started with AI Tales',
                  description: 'Learn how to create your first personalized story in minutes.',
                  link: '/how-it-works',
                },
                {
                  title: 'Understanding Personalization',
                  description: 'Discover how AI Tales creates truly personalized stories for your child.',
                  link: '/features/personalization',
                },
                {
                  title: 'Safety & Privacy',
                  description: 'Learn about our commitment to child safety and data privacy.',
                  link: '/privacy',
                },
                {
                  title: 'Pricing & Plans',
                  description: 'Compare plans and find the perfect option for your family.',
                  link: '/pricing',
                },
              ].map((article, idx) => (
                <Link
                  key={idx}
                  href={article.link}
                  className="p-6 bg-gray-50 rounded-[2rem] border-2 border-white hover:border-playwize-purple transition-all space-y-2 group"
                >
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-playwize-purple transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 font-medium text-sm">{article.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center space-y-8 bg-playwize-purple/10 p-12 rounded-[4rem] border-4 border-playwize-purple/20">
            <h2 className="text-4xl font-black text-gray-900">
              Still Need Help?
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help. Contact us and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px] flex items-center justify-center"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/contact" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Contact Us
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/features" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Features
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
