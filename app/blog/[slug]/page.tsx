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
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <ArticleSchema
                title={post.title}
                description={post.description}
                datePublished={post.date}
                authorName={post.author}
                imageUrl={post.image || 'https://safeaistories.com/og-image.png'}
            />

            {/* Back Button */}
            <div className="container mx-auto max-w-4xl px-4 pt-8">
                <Link href="/blog">
                    <Button variant="outline" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Blog
                    </Button>
                </Link>
            </div>

            {/* Article Header */}
            <article className="container mx-auto max-w-4xl px-4 pb-16">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm">
                            {post.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{post.readingTime}</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <p className="text-xl text-gray-700 mb-6 leading-relaxed">{post.description}</p>

                    <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-semibold text-gray-800">{post.author}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </header>

                {/* Article Content */}
                <div className="prose prose-lg prose-pink max-w-none mb-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-2 border-pink-100">
                        {post.content}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl p-8 md:p-12 text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Create Your Own Bedtime Stories?
                    </h2>
                    <p className="text-xl text-white/90 mb-6">
                        Try Safe AI Stories free and transform bedtime into magical moments!
                    </p>
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className="text-xl px-10 py-6 rounded-full bg-white text-pink-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all font-bold"
                        >
                            Start Free Trial 🎉
                        </Button>
                    </Link>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Related Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPosts.map((relatedPost) => (
                                <Card
                                    key={relatedPost.slug}
                                    className="border-2 border-pink-200 bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                >
                                    <Link href={`/blog/${relatedPost.slug}`}>
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold text-gray-800 hover:text-pink-600 transition-colors line-clamp-2">
                                                {relatedPost.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                {relatedPost.description}
                                            </p>
                                            <div className="flex items-center gap-1 text-pink-600 font-semibold text-sm">
                                                <span>Read More</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </main>
    )
}
