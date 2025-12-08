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
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* Header */}
            <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                        Bedtime Stories & Parenting Blog
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-semibold">
                        Expert tips on bedtime routines, AI storytelling, child development, and creating magical
                        moments with your kids
                    </p>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    {posts.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">Coming Soon!</h2>
                            <p className="text-gray-600">
                                We're working on amazing content about bedtime stories and parenting tips.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Card
                                    key={post.slug}
                                    className="border-2 border-pink-200 bg-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer group"
                                >
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.image && (
                                            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                                                    {post.category}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{post.readingTime}</span>
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                                                {post.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-pink-600 font-semibold group-hover:gap-2 transition-all">
                                                    <span>Read More</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Create Your Own Bedtime Stories?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Try Safe AI Stories free and transform bedtime into magical moments!
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
