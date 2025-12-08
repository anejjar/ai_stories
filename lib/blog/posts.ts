import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
    slug: string
    title: string
    description: string
    date: string
    author: string
    category: string
    keywords: string[]
    readingTime: string
    image?: string
}

export interface BlogPostWithContent extends BlogPost {
    content: any
}

export async function getAllPosts(): Promise<BlogPost[]> {
    // Create directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true })
        return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map((fileName) => {
            const slug = fileName.replace(/\.mdx$/, '')
            const fullPath = path.join(postsDirectory, fileName)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const { data } = matter(fileContents)

            // Calculate reading time (rough estimate: 200 words per minute)
            const wordCount = fileContents.split(/\s+/g).length
            const readingTime = Math.ceil(wordCount / 200)

            return {
                slug,
                title: data.title,
                description: data.description,
                date: data.date,
                author: data.author || 'Safe AI Stories Team',
                category: data.category || 'Parenting',
                keywords: data.keywords || [],
                readingTime: `${readingTime} min read`,
                image: data.image,
            } as BlogPost
        })

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1
        } else {
            return -1
        }
    })
}

export async function getPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.mdx`)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        // Calculate reading time
        const wordCount = content.split(/\s+/g).length
        const readingTime = Math.ceil(wordCount / 200)

        const { content: mdxContent } = await compileMDX({
            source: content,
            options: { parseFrontmatter: false },
        })

        return {
            slug,
            title: data.title,
            description: data.description,
            date: data.date,
            author: data.author || 'Safe AI Stories Team',
            category: data.category || 'Parenting',
            keywords: data.keywords || [],
            readingTime: `${readingTime} min read`,
            image: data.image,
            content: mdxContent,
        }
    } catch (error) {
        return null
    }
}

export function getPostsByCategory(category: string): Promise<BlogPost[]> {
    return getAllPosts().then((posts) => posts.filter((post) => post.category === category))
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): Promise<BlogPost[]> {
    return getAllPosts().then((posts) =>
        posts
            .filter((post) => post.slug !== currentSlug && post.category === category)
            .slice(0, limit)
    )
}
