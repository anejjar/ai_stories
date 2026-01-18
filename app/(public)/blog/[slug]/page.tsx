import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/blog/posts'
import { ArticleSchema } from '@/components/schema/schema-markup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react'

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const posts = await getAllPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
        return {
            title: 'Post Not Found',
        }
    }

    return {
        title: post.title,
        description: post.description,
        keywords: post.keywords,
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            images: post.image ? [post.image] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: post.image ? [post.image] : [],
        },
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(slug, post.category)

  return (
    <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-12 px-4 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

      <ArticleSchema
        title={post.title}
        description={post.description}
        datePublished={post.date}
        authorName={post.author}
        imageUrl={post.image || 'https://ai-tales.com/og-image.png'}
      />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="h-12 px-6 rounded-full border-2 border-gray-100 hover:border-playwize-purple font-black text-gray-700 bg-white shadow-sm transition-all group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO BLOG
          </Button>
        </Link>

        {/* Article Header */}
        <article className="space-y-12 pb-20">
          <header className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-playwize-purple text-white border-0 rounded-full px-4 py-1.5 shadow-sm font-black uppercase tracking-widest text-xs">
                  {post.category}
                </Badge>
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} READ</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {post.title}
              </h1>
            </div>

            <p className="text-xl text-gray-600 font-medium leading-relaxed italic border-l-4 border-playwize-purple pl-6">
              {post.description}
            </p>

            <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border-4 border-gray-50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center font-black text-playwize-purple text-xl shadow-inner">
                  {post.author[0]}
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-none mb-1">{post.author}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-10 px-4 rounded-full border-2 border-gray-100 hover:border-playwize-purple font-black text-xs transition-all">
                <Share2 className="h-4 w-4 mr-2" />
                SHARE
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-[3.5rem] border-4 border-gray-100 shadow-2xl p-8 md:p-16">
            <div className="prose prose-lg prose-purple max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:font-black">
              {post.content}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-playwize-orange rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="space-y-8 relative z-10">
              <div className="text-7xl animate-bounce-slow inline-block">✨</div>
              <h2 className="text-4xl md:text-5xl font-black">
                Ready to Create Magic?
              </h2>
              <p className="text-white/80 text-xl font-bold max-w-2xl mx-auto">
                Transform bedtime into a world of educational adventure with our personalized AI stories.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-16 px-12 rounded-full bg-white text-playwize-orange hover:bg-gray-100 font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Start Your Story 🎉
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="space-y-10 pt-12">
              <h2 className="text-3xl font-black text-gray-900 text-center">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.slug}
                    className="bg-white rounded-[2.5rem] border-4 border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group p-8 space-y-6 flex flex-col"
                  >
                    <Link href={`/blog/${relatedPost.slug}`} className="flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-playwize-purple transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-500 font-medium text-sm line-clamp-2 mt-4 leading-relaxed flex-1">
                        {relatedPost.description}
                      </p>
                      <div className="pt-6">
                        <div className="inline-flex items-center gap-2 text-playwize-purple font-black uppercase tracking-widest text-xs group-hover:gap-3 transition-all">
                          <span>Read More</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  )
}
