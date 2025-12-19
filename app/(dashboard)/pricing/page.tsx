import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    SafetyBadge,
    NoCreditCardBadge,
    MoneyBackBadge,
    AdFreeBadge,
} from '@/components/trust-badges'
import { Shield, DollarSign, Users, CheckCircle, Star, Zap, Crown } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Pricing - Safe AI Bedtime Stories for Kids',
    description:
        'Choose the perfect plan for your family. Start with 1 free story, upgrade to unlimited text stories (PRO) or AI-illustrated picture books (FAMILY PLAN). Cancel anytime.',
    keywords: [
        'ai bedtime stories pricing',
        'bedtime story generator cost',
        'personalized stories subscription',
        'ai story app pricing',
        'family plan pricing',
    ],
}

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-gradient-hero">
            {/* Header */}
            <section className="bg-gradient-primary py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                        Choose Your Perfect Plan
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-semibold mb-8">
                        Start free, upgrade anytime. All plans include 100% kid-safe, personalized stories.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <SafetyBadge />
                        <NoCreditCardBadge />
                        <MoneyBackBadge />
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 px-4 -mt-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free Trial */}
                        <Card className="border-4 border-border bg-card shadow-2xl relative">
                            <CardHeader className="bg-gradient-secondary border-b-4 border-border">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-foreground">Free Trial</CardTitle>
                                        <p className="text-sm text-muted-foreground font-semibold">Try it risk-free</p>
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-foreground">
                                    $0
                                    <span className="text-lg text-muted-foreground font-normal">/forever</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3 mb-6">
                                    {[
                                        '1 Free Story Generation',
                                        'Save & View Your Story',
                                        '100% Kid-Safe Content',
                                        "Personalized with Child's Name",
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/signup">
                                    <Button className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold py-6 rounded-full shadow-lg">
                                        Start Free Trial
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* PRO Plan */}
                        <Card className="border-4 border-primary bg-card shadow-2xl relative">
                            <CardHeader className="bg-gradient-primary border-b-4 border-primary">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-foreground">PRO</CardTitle>
                                        <p className="text-sm text-muted-foreground font-semibold">Most popular</p>
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-foreground">
                                    $9.99
                                    <span className="text-lg text-muted-foreground font-normal">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Unlimited Text Stories',
                                        'Multiple Story Drafts',
                                        'Rewrite & Enhance Tools',
                                        '25+ Story Themes',
                                        'Text-to-Speech Audio',
                                        'Unlimited Storage',
                                        'Ad-Free Experience',
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/signup?tier=pro">
                                    <Button className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold py-6 rounded-full shadow-lg">
                                        Get PRO Now
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* FAMILY PLAN */}
                        <Card className="border-4 border-accent bg-card shadow-2xl relative">
                            <div className="absolute -top-4 right-4">
                                <Badge className="bg-gradient-accent text-accent-foreground font-bold px-4 py-2 text-sm">
                                    ⭐ BEST VALUE
                                </Badge>
                            </div>
                            <CardHeader className="bg-gradient-accent border-b-4 border-accent">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                                        <Crown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-foreground">FAMILY PLAN</CardTitle>
                                        <p className="text-sm text-muted-foreground font-semibold">Perfect for families</p>
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-foreground">
                                    $24.99
                                    <span className="text-lg text-muted-foreground font-normal">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Everything in PRO',
                                        'Up to 3 Child Profiles',
                                        '2 AI-Illustrated Stories/Day',
                                        '10 Text Stories/Day',
                                        'High-Res Picture Books',
                                        'Child Appearance Customization',
                                        'PDF Export for Printing',
                                        'Advanced Art Styles',
                                        'Family Dashboard',
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-foreground font-semibold">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/signup?tier=family">
                                    <Button className="w-full bg-gradient-secondary hover:opacity-90 text-white font-bold py-6 rounded-full shadow-lg">
                                        Get Family Plan Now
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 px-4 bg-card">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl font-bold text-center text-gradient-primary mb-12">
                        Compare All Features
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-primary">
                                    <th className="p-4 text-left font-bold text-foreground">Feature</th>
                                    <th className="p-4 text-center font-bold text-foreground">Free</th>
                                    <th className="p-4 text-center font-bold text-foreground">PRO</th>
                                    <th className="p-4 text-center font-bold text-foreground">FAMILY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Child Profiles', free: '1', pro: '2', family: '3' },
                                    { feature: 'Text Stories/Day', free: '1 (lifetime)', pro: 'Unlimited', family: '10' },
                                    { feature: 'Illustrated Stories/Day', free: '—', pro: '—', family: '2' },
                                    { feature: 'Story Drafts', free: '—', pro: 'Multiple', family: 'Multiple' },
                                    { feature: 'Rewrite Tools', free: '—', pro: '✓', family: '✓' },
                                    { feature: 'Text-to-Speech', free: '—', pro: '✓', family: '✓' },
                                    { feature: 'PDF Export', free: '—', pro: '—', family: '✓' },
                                    { feature: 'Custom Art Styles', free: '—', pro: '—', family: '✓' },
                                    { feature: 'Ad-Free', free: '✓', pro: '✓', family: '✓' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-border">
                                        <td className="p-4 font-semibold text-foreground">{row.feature}</td>
                                        <td className="p-4 text-center text-muted-foreground">{row.free}</td>
                                        <td className="p-4 text-center text-muted-foreground">{row.pro}</td>
                                        <td className="p-4 text-center text-muted-foreground font-semibold">{row.family}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl font-bold text-center text-gradient-primary mb-12">
                        Pricing FAQs
                    </h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Yes! Cancel your subscription anytime with one click. No questions asked, no cancellation fees.',
                            },
                            {
                                q: 'Is there a money-back guarantee?',
                                a: 'Absolutely! We offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund you in full.',
                            },
                            {
                                q: 'Do I need a credit card for the free trial?',
                                a: 'No! The free trial gives you 1 story with no credit card required. Try it completely risk-free.',
                            },
                            {
                                q: 'Can I upgrade or downgrade my plan?',
                                a: 'Yes, you can change your plan anytime. Upgrades take effect immediately, and downgrades apply at the next billing cycle.',
                            },
                            {
                                q: 'Are the stories really safe for kids?',
                                a: 'Yes! Every story passes through multiple child-safety filters. We use advanced AI content moderation and human oversight to ensure 100% kid-safe content.',
                            },
                        ].map((faq, idx) => (
                            <Card key={idx} className="border-2 border-border bg-card shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-foreground">{faq.q}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-primary">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Transform Bedtime?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Start your free trial today—no credit card required!
                    </p>
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className="text-xl px-12 py-8 rounded-full bg-white text-pink-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all font-bold"
                        >
                            Start Free Trial 🎉
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    )
}
