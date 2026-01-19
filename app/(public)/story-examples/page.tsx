import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Sparkles, Star, Heart, Rocket, Check } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/components/schema/schema-markup'

export const metadata: Metadata = {
  title: 'AI Story Examples for Kids - See Personalized Stories in Action | AI Tales',
  description:
    'See AI Tales stories in action. Browse personalized story examples for different ages and themes. See how your child becomes the hero of their own adventure.',
  keywords: [
    'AI story examples for kids',
    'personalized story samples',
    'bedtime story examples',
    'AI story samples',
    'personalized children\'s story examples',
    'story generator examples',
  ],
  openGraph: {
    title: 'AI Story Examples for Kids | AI Tales',
    description: 'See AI Tales stories in action. Browse personalized story examples for different ages and themes.',
    url: 'https://ai-tales.com/story-examples',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AI Tales Story Examples' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Story Examples for Kids | AI Tales',
    description: 'See AI Tales stories in action. Browse personalized story examples for different ages and themes.',
  },
}

const exampleStories = [
  {
    title: 'Emma\'s Dinosaur Adventure',
    age: 'Ages 5-7',
    theme: 'Adventure & Sharing',
    excerpt: 'Emma loved dinosaurs more than anything. One day, she discovered a magical T-Rex egg in her backyard. The baby T-Rex needed her help to learn about sharing with other dinosaurs. Through her adventure, Emma discovered that sharing makes friendships stronger...',
    learning: 'Teaches sharing and friendship',
    personalization: 'Features child\'s interest (dinosaurs) and addresses learning goal (sharing)',
  },
  {
    title: 'Jake\'s Space Mission',
    age: 'Ages 7-9',
    theme: 'Courage & Problem-Solving',
    excerpt: 'Jake was curious about space and always dreamed of being an astronaut. When a friendly alien needed help fixing their spaceship, Jake used his problem-solving skills to help. He learned that courage means trying even when things seem difficult...',
    learning: 'Builds courage and problem-solving skills',
    personalization: 'Matches child\'s curiosity about space and teaches courage',
  },
  {
    title: 'Sophia\'s Kindness Quest',
    age: 'Ages 4-6',
    theme: 'Kindness & Empathy',
    excerpt: 'Sophia noticed a sad bunny in the forest. She decided to help by showing kindness and understanding. Through her quest, she learned that small acts of kindness can make a big difference in someone\'s day...',
    learning: 'Develops empathy and kindness',
    personalization: 'Teaches social-emotional skills through relatable scenarios',
  },
]

const storyTypes = [
  {
    type: 'Adventure Stories',
    description: 'Exciting journeys where your child explores new worlds and faces challenges.',
    examples: ['Space missions', 'Treasure hunts', 'Magical kingdoms'],
  },
  {
    type: 'Educational Stories',
    description: 'Stories that teach STEM concepts, history, or science through engaging narratives.',
    examples: ['Science discoveries', 'Historical adventures', 'Nature explorations'],
  },
  {
    type: 'Social-Emotional Stories',
    description: 'Stories that teach empathy, kindness, courage, and emotional intelligence.',
    examples: ['Friendship tales', 'Kindness quests', 'Courage adventures'],
  },
  {
    type: 'Bedtime Stories',
    description: 'Calming stories perfect for bedtime, designed to help children relax and sleep.',
    examples: ['Dreamy adventures', 'Peaceful journeys', 'Gentle tales'],
  },
]

export default function StoryExamplesPage() {
  return (
    <>
      <ArticleSchema
        title="AI Story Examples for Kids - See Personalized Stories in Action"
        description="See AI Tales stories in action. Browse personalized story examples for different ages and themes. See how your child becomes the hero of their own adventure."
        datePublished="2024-01-01"
        dateModified="2024-12-01"
        authorName="AI Tales Team"
        imageUrl="https://ai-tales.com/og-image.png"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ai-tales.com' },
          { name: 'Story Examples', url: 'https://ai-tales.com/story-examples' },
        ]}
      />
      <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
              <BookOpen className="h-4 w-4" />
              <span>Story Showcase</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              See AI Tales Stories <br />
              <span className="text-playwize-orange">in Action</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Browse personalized story examples for different ages and themes. See how your child becomes the hero of their own adventure with stories that match their interests and teach valuable lessons.
            </p>
          </div>

          {/* Example Stories */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Example Personalized Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {exampleStories.map((story, idx) => (
                <div key={idx} className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-playwize-purple/10 text-playwize-purple rounded-full text-sm font-bold">
                      {story.age}
                    </span>
                    <span className="px-3 py-1 bg-playwize-orange/10 text-playwize-orange rounded-full text-sm font-bold">
                      {story.theme}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{story.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed italic">
                    "{story.excerpt}"
                  </p>
                  <div className="pt-4 space-y-2 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-playwize-orange shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium text-sm">{story.learning}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-playwize-purple shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium text-sm">{story.personalization}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story Types */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Different Types of Stories
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {storyTypes.map((type, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-[3rem] border-2 border-white space-y-4">
                  <h3 className="text-2xl font-black text-gray-900">{type.type}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{type.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {type.examples.map((example, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-sm font-bold text-gray-700 border border-gray-200">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Examples */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              Stories for Every Age
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  age: 'Ages 3-5',
                  focus: 'Simple & Visual',
                  description: 'Short stories with simple vocabulary, basic concepts, and visual elements. Perfect for early readers.',
                  example: 'Simple adventures with familiar characters and basic problem-solving.',
                },
                {
                  age: 'Ages 6-8',
                  focus: 'Engaging & Educational',
                  description: 'Longer stories with expanded vocabulary, comprehension questions, and educational themes.',
                  example: 'Adventure stories with learning objectives and interactive elements.',
                },
                {
                  age: 'Ages 9-12',
                  focus: 'Complex & Challenging',
                  description: 'Sophisticated narratives with advanced vocabulary, STEM concepts, and character development.',
                  example: 'Complex adventures with multiple plot points and deeper themes.',
                },
              ].map((group, idx) => (
                <div key={idx} className="bg-white/60 p-8 rounded-[3rem] border-2 border-gray-100 space-y-4">
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
                  <div className="pt-2">
                    <p className="text-gray-500 font-bold text-xs">Example:</p>
                    <p className="text-gray-600 font-medium text-sm italic">{group.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Makes These Stories Special */}
          <div className="bg-white/60 p-12 rounded-[4rem] border-4 border-gray-100 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 text-center">
              What Makes AI Tales Stories Special
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Truly Personalized',
                  description: 'Not just name insertion—entire narratives crafted around your child\'s interests and personality.',
                },
                {
                  title: 'Educational Value',
                  description: 'Every story teaches specific skills: vocabulary, comprehension, emotional intelligence, or STEM concepts.',
                },
                {
                  title: 'Age-Appropriate',
                  description: 'Stories automatically adapt to your child\'s reading level and developmental stage.',
                },
                {
                  title: 'Interactive Elements',
                  description: 'Comprehension questions, choice-driven narratives, and creative prompts keep children engaged.',
                },
                {
                  title: 'Safe & Moderated',
                  description: '100% kid-safe content with human moderation ensuring age-appropriate, wholesome stories.',
                },
                {
                  title: 'Unlimited Variety',
                  description: 'Create as many stories as you want. Every story is unique, even with the same theme.',
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-[2rem] border-2 border-white">
                  <Check className="h-6 w-6 text-playwize-purple shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8 bg-playwize-orange/10 p-12 rounded-[4rem] border-4 border-playwize-orange/20">
            <h2 className="text-4xl font-black text-gray-900">
              Create Your Own Personalized Story
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              See how easy it is to create stories like these for your child. Start with 1 free story—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 rounded-full bg-playwize-orange hover:bg-orange-600 text-white font-black text-lg shadow-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/signup">
                  Create Your First Story
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-playwize-orange text-playwize-orange hover:bg-playwize-orange hover:text-white font-black text-lg min-w-[200px] min-h-[56px]"
              >
                <Link href="/how-it-works">
                  Learn How It Works
                </Link>
              </Button>
            </div>
          </div>

          {/* Internal Links */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/features/personalization" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Personalization
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/how-it-works" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                How It Works
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/pricing" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                Pricing
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/features" className="text-gray-500 hover:text-playwize-purple font-bold transition-colors">
                All Features
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
