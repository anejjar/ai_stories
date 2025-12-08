'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FAQSection } from '@/components/faq-section'
import Link from 'next/link'
import {
  BookOpen,
  Sparkles,
  Star,
  Heart,
  Crown,
  Zap,
  Shield,
  Infinity,
  Check,
  Users,
  Award,
  Lock,
  ArrowRight,
  Play,
  Image as ImageIcon,
  FileText,
  Volume2,
  Palette,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/library')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-hero">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-accent animate-sparkle" />
        </div>
      </main>
    )
  }

  // Define handlers before early returns
  const handleGetStarted = () => {
    router.push('/signup')
  }

  const handleUpgrade = (tier: 'pro' | 'pro_max') => {
    router.push(`/signup?tier=${tier}`)
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-gradient-hero">
      {/* Animated Background Decorations */}
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-30" style={{ animationDelay: '0s' }}>⭐</div>
      <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute bottom-40 left-20 text-6xl animate-float opacity-30" style={{ animationDelay: '2s' }}>🌟</div>
      <div className="absolute bottom-60 right-10 text-5xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>💫</div>
      <div className="absolute top-60 left-1/3 text-4xl animate-bounce-slow opacity-20">🎈</div>
      <div className="absolute bottom-80 right-1/3 text-4xl animate-bounce-slow opacity-20" style={{ animationDelay: '1s' }}>🎨</div>
      <div className="absolute top-1/2 left-10 text-5xl animate-float opacity-20" style={{ animationDelay: '2.5s' }}>📚</div>
      <div className="absolute top-1/3 right-10 text-5xl animate-float opacity-20" style={{ animationDelay: '3s' }}>🎭</div>

      {/* Cloud decorations */}
      <div className="absolute top-32 right-1/4 text-8xl opacity-10 animate-float cloud">☁️</div>
      <div className="absolute bottom-32 left-1/4 text-7xl opacity-10 animate-float cloud" style={{ animationDelay: '2s' }}>☁️</div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-accent text-accent-foreground font-bold px-6 py-2 rounded-full text-sm border-2 border-white shadow-xl animate-pulse">
                <Star className="h-4 w-4 mr-2 inline" />
                Join 1,000+ Happy Families! 🎉
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl animate-bounce-slow transform hover:scale-110 transition-transform">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl animate-wiggle">✨</div>
                  <div className="absolute -bottom-2 -left-2 text-4xl animate-wiggle" style={{ animationDelay: '0.5s' }}>⭐</div>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-comic text-gradient-primary drop-shadow-lg leading-tight">
                Create Magical AI Bedtime Stories<br />
                Your Child Will Love ✨
              </h1>

              <p className="text-xl md:text-2xl lg:text-3xl text-foreground max-w-3xl mx-auto font-semibold leading-relaxed">
                Transform bedtime struggles into cherished moments with personalized, safe stories crafted by AI in seconds—no screens, no ads, just pure imagination.
                <span className="text-gradient-accent font-bold">100% kid-safe</span> and designed for magical bonding time. 🌙
              </p>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2 text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-7 w-7 fill-current animate-sparkle" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
                <span className="ml-2 text-foreground font-bold text-lg">5.0 Rating</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full sm:w-auto text-xl px-10 py-7 rounded-full bg-gradient-primary hover:opacity-90 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all font-bold text-white border-4 border-white"
              >
                <Sparkles className="h-6 w-6 mr-2" />
                Start Free Trial! 🎉
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-xl px-10 py-7 rounded-full border-4 border-primary hover:bg-primary/10 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold bg-card"
                >
                  Sign In 👋
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>100% Kid-Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>1 Free Story</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
              Why Parents Trust Safe AI Stories for Bedtime 💖
            </h2>
            <p className="text-xl text-muted-foreground font-semibold">
              Join thousands of families creating magical bedtime memories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                role: 'Mom of 2',
                content: 'My kids absolutely love seeing themselves in the stories! Bedtime has become their favorite time of day. Worth every penny! 🌟',
                rating: 5,
              },
              {
                name: 'Michael T.',
                role: 'Dad',
                content: 'The PRO MAX illustrations are incredible! My daughter\'s face lights up when she sees herself as a princess in the storybook. Pure magic! ✨',
                rating: 5,
              },
              {
                name: 'Emma L.',
                role: 'Mom',
                content: 'I love being able to generate multiple drafts and pick the perfect story. The rewrite tools are amazing - we can make stories calmer for bedtime! 😊',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="border-4 border-primary/30 bg-gradient-to-br from-card to-primary/5 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg font-bold text-card-foreground">{testimonial.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-semibold">{testimonial.role}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground font-medium leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-4 bg-gradient-secondary px-8 py-4 rounded-full border-4 border-accent shadow-lg">
              <Users className="h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="text-3xl font-bold text-gradient-primary">
                  1,000+
                </div>
                <div className="text-sm text-muted-foreground font-semibold">Happy Families</div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-gradient-primary">
                  5,000+
                </div>
                <div className="text-sm text-muted-foreground font-semibold">Stories Created</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
              How Safe AI Stories Works—Bedtime Magic in 3 Simple Steps ✨
            </h2>
            <p className="text-xl text-muted-foreground font-semibold max-w-2xl mx-auto">
              Start with 1 free story, then unlock unlimited possibilities with PRO or PRO MAX
            </p>
          </div>

          {/* Free Trial Features */}
          <Card className="mb-12 border-4 border-primary shadow-2xl">
            <CardHeader className="bg-gradient-secondary border-b-4 border-primary">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gradient-primary">
                    Free Trial 🎁
                  </CardTitle>
                  <p className="text-muted-foreground font-semibold mt-1">Try it risk-free!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, text: '1 Free Story Generation', emoji: '📚' },
                  { icon: Heart, text: 'Save & View Your Story', emoji: '💾' },
                  { icon: Shield, text: '100% Kid-Safe Content', emoji: '🛡️' },
                  { icon: Sparkles, text: 'Personalized with Child\'s Name', emoji: '✨' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-card/80 rounded-xl border-2 border-border">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{feature.emoji}</span>
                      <span className="font-bold text-foreground">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PRO Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-4 border-primary/50 bg-gradient-to-br from-card to-primary/10 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
              <CardHeader className="bg-gradient-primary border-b-4 border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">
                        PRO ✨
                      </CardTitle>
                      <p className="text-white/90 font-semibold text-sm">$9.99/month</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { text: 'Unlimited text story generation', emoji: '📚', icon: Infinity },
                    { text: 'Multiple story drafts (choose your favorite!)', emoji: '📝', icon: Zap },
                    { text: 'Rewrite and enhance tools', emoji: '✨', icon: Zap },
                    { text: '25+ story themes', emoji: '🎭', icon: Sparkles },
                    { text: '10 story templates', emoji: '📋', icon: FileText },
                    { text: 'Ad-free experience', emoji: '🛡️', icon: Shield },
                    { text: 'Unlimited story storage', emoji: '💾', icon: Heart },
                    { text: 'Text-to-Speech bedtime audio', emoji: '🔊', icon: Volume2 },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-card/90 rounded-xl border-2 border-border">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl">{feature.emoji}</span>
                      <span className="font-semibold text-foreground flex-1">{feature.text}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleUpgrade('pro')}
                  className="w-full mt-6 rounded-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg py-6"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get PRO Now! ✨
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* PRO MAX Features */}
            <Card className="border-4 border-accent bg-gradient-to-br from-card to-accent/10 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 relative">
              <div className="absolute -top-4 right-4 z-10">
                <Badge className="bg-gradient-secondary text-secondary-foreground font-bold px-4 py-2 rounded-full text-sm border-2 border-white shadow-xl">
                  <Star className="h-3 w-3 mr-1 inline" />
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="bg-gradient-secondary border-b-4 border-accent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gradient-primary">
                        PRO MAX 👑
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground font-semibold text-sm">$19.99/month</p>
                        <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5">
                          Save 33% ✨
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { text: 'Everything in PRO', emoji: '⭐', icon: Crown, highlight: true },
                    { text: 'AI-illustrated stories with your child', emoji: '🎨', icon: ImageIcon },
                    { text: 'High-resolution picture-book images', emoji: '🖼️', icon: ImageIcon },
                    { text: 'Child appearance customization', emoji: '👤', icon: Palette },
                    { text: 'Unlimited illustrated story generations', emoji: '🚀', icon: Zap },
                    { text: 'PDF export for printing', emoji: '📄', icon: FileText },
                    { text: 'Advanced themes & art styles', emoji: '🌟', icon: Sparkles },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 ${feature.highlight
                        ? 'bg-gradient-accent border-accent'
                        : 'bg-card/90 border-border'
                        }`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${feature.highlight
                        ? 'bg-gradient-secondary'
                        : 'bg-gradient-primary'
                        }`}>
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl">{feature.emoji}</span>
                      <span className={`font-semibold flex-1 ${feature.highlight ? 'text-foreground font-bold' : 'text-foreground'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleUpgrade('pro_max')}
                  className="w-full mt-6 rounded-full bg-gradient-secondary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg py-6"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Get PRO MAX Now! 👑
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
              Transform Bedtime into Quality Bonding Time 💖
            </h2>
            <p className="text-xl text-muted-foreground font-semibold">
              More than just stories - create lasting memories and teach valuable lessons
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                emoji: '🌙',
                title: 'Perfect Bedtime Routine',
                description: 'Create calming stories that help your child wind down and sleep peacefully. Make bedtime magical!',
                color: 'from-blue-400 to-purple-500',
              },
              {
                emoji: '🎓',
                title: 'Educational & Fun',
                description: 'Teach important values like kindness, courage, and friendship through engaging adventures.',
                color: 'from-green-400 to-emerald-500',
              },
              {
                emoji: '💝',
                title: 'Builds Self-Esteem',
                description: 'Seeing themselves as the hero boosts confidence and imagination. Your child will love being the star!',
                color: 'from-pink-400 to-rose-500',
              },
              {
                emoji: '👨‍👩‍👧‍👦',
                title: 'Family Bonding',
                description: 'Create special moments together. Read stories featuring your child and watch their face light up!',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                emoji: '🎨',
                title: 'Unlimited Creativity',
                description: 'Generate as many stories as you want with different themes, characters, and adventures!',
                color: 'from-purple-400 to-pink-500',
              },
              {
                emoji: '📚',
                title: 'Forever Memories',
                description: 'Save all your stories and create a personalized library. Print them as keepsakes!',
                color: 'from-cyan-400 to-blue-500',
              },
            ].map((benefit, idx) => (
              <Card
                key={idx}
                className="border-4 border-primary/30 bg-card shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <CardContent className="pt-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-4xl">{benefit.emoji}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center">{benefit.title}</h3>
                  <p className="text-muted-foreground font-medium text-center leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="relative z-10 py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
              Expert Parenting Tips & Bedtime Story Ideas 📚
            </h2>
            <p className="text-xl text-muted-foreground font-semibold max-w-2xl mx-auto">
              Discover research-backed advice, creative story ideas, and expert tips for better bedtimes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Blog Post 1 */}
            <Card className="border-2 border-primary bg-gradient-to-br from-card to-primary/5 shadow-lg hover:shadow-2xl transition-all hover:scale-105 group">
              <Link href="/blog/bedtime-stories-help-sleep-science">
                <CardHeader>
                  <Badge className="bg-gradient-primary text-white mb-3 w-fit">
                    Sleep Science
                  </Badge>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    The Science Behind Why Bedtime Stories Help Kids Sleep Better
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    Discover the latest research on how bedtime stories improve sleep quality, reduce anxiety, and create lasting bonds.
                  </p>
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Blog Post 2 */}
            <Card className="border-2 border-secondary bg-gradient-to-br from-card to-secondary/5 shadow-lg hover:shadow-2xl transition-all hover:scale-105 group">
              <Link href="/blog/creative-bedtime-story-ideas">
                <CardHeader>
                  <Badge className="bg-gradient-secondary text-secondary-foreground mb-3 w-fit">
                    Story Ideas
                  </Badge>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-secondary transition-colors">
                    27 Creative Bedtime Story Ideas When You're Too Tired to Think
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    Never run out of story ideas again! Quick, creative prompts for magical tales that calm kids down.
                  </p>
                  <div className="flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Blog Post 3 */}
            <Card className="border-2 border-accent bg-gradient-to-br from-card to-accent/5 shadow-lg hover:shadow-2xl transition-all hover:scale-105 group">
              <Link href="/blog/personalized-stories-reduce-anxiety">
                <CardHeader>
                  <Badge className="bg-gradient-accent text-accent-foreground mb-3 w-fit">
                    Child Development
                  </Badge>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                    How to Use Personalized Stories to Reduce Bedtime Anxiety
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    Practical strategies for using personalized stories to help anxious children feel safe and overcome fears.
                  </p>
                  <div className="flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/blog">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-2 border-primary hover:bg-primary/10 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                View All Articles
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Ready to Create Magic? ✨
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-semibold max-w-2xl mx-auto">
              Start your free trial today and create your first personalized story in minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full sm:w-auto text-xl px-12 py-8 rounded-full bg-white text-primary hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all font-bold border-4 border-accent"
              >
                <Sparkles className="h-6 w-6 mr-2" />
                Start Free Trial! 🎉
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-white font-semibold">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>1 Free Story</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold font-comic">Safe AI Stories</span>
              </div>
              <p className="text-gray-400 font-medium">
                Creating magical bedtime memories, one story at a time. ✨
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 font-medium">
                <li><Link href="/signup" className="hover:text-primary transition-colors">Free Trial</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/signup?tier=pro" className="hover:text-primary transition-colors">PRO Plan</Link></li>
                <li><Link href="/signup?tier=pro_max" className="hover:text-primary transition-colors">PRO MAX Plan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 font-medium">
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/blog/bedtime-stories-help-sleep-science" className="hover:text-primary transition-colors">Sleep Science</Link></li>
                <li><Link href="/blog/creative-bedtime-story-ideas" className="hover:text-primary transition-colors">Story Ideas</Link></li>
                <li><Link href="/blog/personalized-stories-reduce-anxiety" className="hover:text-primary transition-colors">Reduce Anxiety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 font-medium">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy & Safety</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 font-medium">
            <p>© 2025 Safe AI Stories. Made with 💖 for families everywhere.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
