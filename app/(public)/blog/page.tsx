import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog/posts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Blog - Bedtime Stories & Parenting Tips',
    description:
        'Expert advice on bedtime routines, AI storytelling, child development, and creating magical moments with your kids. Tips from parenting experts and child psychologists.',
    keywords: [
        'bedtime stories blog',
        'parenting tips',
        'bedtime routine advice',
        'child development',
        'ai storytelling',
        'bedtime anxiety',
        'story ideas for kids',
    ],
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-20 px-4 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
            <BookOpen className="h-4 w-4" />
            <span>Parenting Guide</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
            Magical <br />
            <span className="text-playwize-purple">Bedtime Blog</span>
          </h1>
          <p className="text-xl text-gray-600 font-medium leading-relaxed">
            Expert tips on bedtime routines, AI storytelling, child development, and creating magical moments with your kids.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <section className="pb-20">
          {posts.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-gray-100 space-y-8 max-w-2xl mx-auto">
              <div className="h-40 w-40 rounded-[3rem] bg-purple-50 flex items-center justify-center shadow-inner animate-float-gentle mx-auto">
                <BookOpen className="h-20 w-20 text-playwize-purple opacity-40" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">Coming Soon!</h2>
                <p className="text-gray-500 font-bold max-w-md mx-auto">
                  We are working on amazing content about bedtime stories and parenting tips. Stay tuned! ✨
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="bg-white rounded-[3.5rem] border-4 border-gray-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 group overflow-hidden flex flex-col"
                >
                  <Link href={`/blog/${post.slug}`} className="flex-1 flex flex-col">
                    {post.image && (
                      <div className="relative h-64 w-full overflow-hidden border-b-4 border-gray-100">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/95 text-playwize-purple border-0 shadow-lg font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-10 flex-1 flex flex-col space-y-6">
                      <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-gray-200">|</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{post.readingTime}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-playwize-purple transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-500 font-medium line-clamp-3 leading-relaxed">
                        {post.description}
                      </p>
                      
                      <div className="pt-4 mt-auto">
                        <div className="inline-flex items-center gap-2 text-playwize-purple font-black uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                          <span>Read Article</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <div className="bg-playwize-purple rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="space-y-8 relative z-10">
            <div className="text-7xl animate-bounce-slow inline-block">🎁</div>
            <h2 className="text-4xl md:text-5xl font-black">
              Ready to Create Your Own Stories?
            </h2>
            <p className="text-white/80 text-xl font-bold max-w-2xl mx-auto">
              Join thousands of parents and transform bedtime into a world of magical discovery.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-16 px-12 rounded-full bg-white text-playwize-purple hover:bg-gray-100 font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Get Started For Free 🎉
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
