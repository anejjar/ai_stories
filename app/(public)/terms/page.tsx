import { Metadata } from 'next'
import Link from 'next/link'
import { ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'Terms of Service - AI Tales | AI Story Generator Terms',
  description:
    'Read AI Tales Terms of Service. Learn about our service agreement, user accounts, payment terms, content policies, and limitations of liability for our AI story generator platform.',
  keywords: [
    'AI Tales terms of service',
    'story generator terms',
    'service agreement',
    'AI stories terms',
    'terms and conditions',
    'user agreement',
  ],
  openGraph: {
    title: 'Terms of Service - AI Tales',
    description: 'Read AI Tales Terms of Service. Learn about our service agreement, user accounts, payment terms, and content policies.',
    url: 'https://ai-tales.com/terms',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Terms of Service' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - AI Tales',
    description: 'Read AI Tales Terms of Service. Learn about our service agreement, user accounts, payment terms, and content policies.',
  },
}

export default function TermsPage() {
  return (
    <>
      <ArticleSchema
        title="Terms of Service - AI Tales"
        description="Read AI Tales Terms of Service. Learn about our service agreement, user accounts, payment terms, content policies, and limitations of liability for our AI story generator platform."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Terms of Service', url: 'https://ai-tales.com/terms' },
        ]}
      />
      <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Terms of Service <br />
              <span className="text-playwize-purple">AI Tales</span>
            </h1>
            <p className="text-lg text-gray-500 font-bold">
              Last updated: December 2024
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-12">
            {/* Acceptance of Terms */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">1. Acceptance of Terms</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                By accessing and using AI Tales ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Service Description */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">2. Service Description</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                AI Tales is an AI-powered platform that generates personalized bedtime stories for children. Our service uses advanced AI technology (Google Gemini) to create educational, age-appropriate stories featuring your child as the main character.
              </p>
              <p className="text-gray-600 font-medium leading-relaxed">
                We offer a free trial (1 story) and paid subscription plans (Pro and Family) that provide access to unlimited story generation and additional features.
              </p>
            </section>

            {/* User Accounts */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">3. User Accounts</h2>
              <div className="space-y-3">
                <p className="text-gray-600 font-medium leading-relaxed">
                  To use AI Tales, you must:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 font-medium ml-4">
                  <li>Be at least 18 years old or have parental consent</li>
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Be responsible for all activities that occur under your account</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">4. Payment Terms</h2>
              <div className="space-y-3">
                <p className="text-gray-600 font-medium leading-relaxed">
                  Subscription Plans:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 font-medium ml-4">
                  <li><strong>Free Trial:</strong> 1 free story, no credit card required</li>
                  <li><strong>Pro Plan:</strong> $9.99/month (billed monthly) or $99/year (billed annually)</li>
                  <li><strong>Family Plan:</strong> $19.99/month (billed monthly) or $199/year (billed annually)</li>
                </ul>
                <p className="text-gray-600 font-medium leading-relaxed pt-4">
                  All subscriptions automatically renew unless cancelled. You can cancel anytime from your account settings. Refunds are available within 30 days of purchase if you're not satisfied with the service.
                </p>
              </div>
            </section>

            {/* Content and Intellectual Property */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">5. Content and Intellectual Property</h2>
              <div className="space-y-3">
                <p className="text-gray-600 font-medium leading-relaxed">
                  <strong>Your Content:</strong> Stories generated using AI Tales are yours to use, share, and enjoy. You retain ownership of the personalized content created for your child.
                </p>
                <p className="text-gray-600 font-medium leading-relaxed">
                  <strong>Our Content:</strong> The AI Tales platform, technology, design, and all associated intellectual property are owned by AI Tales and protected by copyright and other intellectual property laws.
                </p>
                <p className="text-gray-600 font-medium leading-relaxed">
                  <strong>Usage Rights:</strong> You may not copy, modify, distribute, sell, or lease any part of our service without our written permission.
                </p>
              </div>
            </section>

            {/* Age Restrictions and Child Safety */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">6. Age Restrictions and Child Safety</h2>
              <div className="space-y-3">
                <p className="text-gray-600 font-medium leading-relaxed">
                  AI Tales is designed for children ages 3-12. All content is:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 font-medium ml-4">
                  <li>100% kid-safe and age-appropriate</li>
                  <li>Human-moderated for safety</li>
                  <li>COPPA compliant</li>
                  <li>Free from violence, inappropriate content, or fear-inducing themes</li>
                </ul>
                <p className="text-gray-600 font-medium leading-relaxed pt-4">
                  Parents are responsible for supervising their child's use of the service and ensuring stories are appropriate for their child's age and development.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">7. Limitation of Liability</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                AI Tales provides the service "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or completely secure. To the maximum extent permitted by law, AI Tales shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">8. Changes to Terms</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Termination */}
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900">9. Termination</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
              <p className="text-gray-600 font-medium leading-relaxed">
                You may cancel your subscription at any time from your account settings. Upon cancellation, you will continue to have access to the service until the end of your current billing period.
              </p>
            </section>

            {/* Contact for Questions */}
            <section className="space-y-4 pt-8 border-t border-gray-200">
              <h2 className="text-3xl font-black text-gray-900">10. Contact for Questions</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
                <p className="text-gray-700 font-bold">
                  Email: <a href="mailto:legal@ai-tales.com" className="text-playwize-purple hover:underline">legal@ai-tales.com</a>
                </p>
                <p className="text-gray-700 font-bold mt-2">
                  Support: <a href="mailto:support@ai-tales.com" className="text-playwize-purple hover:underline">support@ai-tales.com</a>
                </p>
                <p className="text-gray-700 font-bold mt-2">
                  Or visit our <Link href="/contact" className="text-playwize-purple hover:underline">Contact Page</Link>
                </p>
              </div>
            </section>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/contact" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Contact Us
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/support" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Help Center
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
