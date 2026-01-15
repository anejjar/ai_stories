import { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/support/contact-form'
import { Mail, Clock, MessageSquare, ArrowRight } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'Contact AI Tales - Get Support for AI Story Generator | AI Tales',
  description:
    'Get in touch with AI Tales support team. Have questions about our AI story generator? Need help? Contact us via email or use our support form. We\'re here to help.',
  keywords: [
    'contact AI Tales',
    'AI story support',
    'story generator help',
    'AI Tales customer service',
    'support contact',
    'help center contact',
  ],
  openGraph: {
    title: 'Contact AI Tales - Get Support | AI Tales',
    description: 'Get in touch with AI Tales support team. Have questions about our AI story generator? Contact us via email or use our support form.',
    url: 'https://ai-tales.com/contact',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Contact AI Tales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact AI Tales - Get Support | AI Tales',
    description: 'Get in touch with AI Tales support team. Have questions about our AI story generator? Contact us via email or use our support form.',
  },
}

export default function ContactPage() {
  return (
    <>
      <ArticleSchema
        title="Contact AI Tales - Get Support for AI Story Generator"
        description="Get in touch with AI Tales support team. Have questions about our AI story generator? Need help? Contact us via email or use our support form."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Contact', url: 'https://ai-tales.com/contact' },
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
              <MessageSquare className="h-4 w-4" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Get in Touch with <br />
              <span className="text-playwize-purple">AI Tales</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Have questions about our AI story generator? Need help with your account? Want to share feedback? We're here to help. Reach out anytime.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 mb-8">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-playwize-purple flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Email Us</h3>
                    <a href="mailto:support@ai-tales.com" className="text-playwize-purple font-bold hover:underline">
                      support@ai-tales.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-playwize-orange flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Support Hours</h3>
                    <p className="text-gray-600 font-bold text-sm">
                      Monday - Friday<br />
                      9:00 AM - 6:00 PM EST
                    </p>
                    <p className="text-gray-500 font-medium text-xs mt-2">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                <h3 className="text-xl font-black text-gray-900">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/support" className="flex items-center gap-3 text-gray-600 hover:text-playwize-purple font-bold transition-colors">
                    <ArrowRight className="h-4 w-4" />
                    <span>Visit Help Center</span>
                  </Link>
                  <Link href="/support" className="flex items-center gap-3 text-gray-600 hover:text-playwize-purple font-bold transition-colors">
                    <ArrowRight className="h-4 w-4" />
                    <span>Browse FAQs</span>
                  </Link>
                  <Link href="/about" className="flex items-center gap-3 text-gray-600 hover:text-playwize-purple font-bold transition-colors">
                    <ArrowRight className="h-4 w-4" />
                    <span>Learn About Us</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-3xl font-black text-gray-900 text-center">
              Common Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How quickly will I receive a response?',
                  a: 'We typically respond to all inquiries within 24 hours during business days.',
                },
                {
                  q: 'Can I get help with my account?',
                  a: 'Yes! Use the "Account Issue" category when submitting your message for faster assistance.',
                },
                {
                  q: 'Do you offer phone support?',
                  a: 'Currently, we offer email and form-based support. This allows us to provide detailed, written responses.',
                },
                {
                  q: 'Can I request a feature?',
                  a: 'Absolutely! Use the "General Question" category and share your ideas. We love hearing from our community.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-white space-y-3">
                  <h4 className="text-lg font-black text-gray-900">{faq.q}</h4>
                  <p className="text-gray-600 font-medium text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center pt-4">
              <Link
                href="/support"
                className="inline-flex items-center gap-2 text-playwize-purple font-bold hover:underline"
              >
                View All FAQs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/support" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Help Center
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/about" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                About AI Tales
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/privacy" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Privacy Policy
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
