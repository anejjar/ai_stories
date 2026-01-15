/**
 * Schema Markup Components for SEO
 * Implements JSON-LD structured data for Google rich results
 */

interface SchemaMarkupProps {
    type: 'software' | 'faq' | 'organization' | 'article'
    data?: any
}

export function SoftwareApplicationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI Tales',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            priceValidUntil: '2025-12-31',
            availability: 'https://schema.org/InStock',
            description: 'Free trial available - 1 free story',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '2000',
            bestRating: '5',
            worstRating: '1',
        },
        description:
            'Create unlimited personalized bedtime stories in seconds with AI. Safe, educational, human-moderated stories where your child is the hero.',
        featureList: [
            'Personalized stories with child\'s name',
            'Age-appropriate content filtering',
            'Unlimited story generation',
            'Ad-free experience',
            'AI-illustrated stories',
            'Safety-reviewed content',
            'Text-to-speech audio',
            'Interactive learning elements',
        ],
        author: {
            '@type': 'Organization',
            name: 'AI Tales',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AI Tales',
        url: 'https://ai-tales.com',
        logo: 'https://ai-tales.com/logo.png',
        description: 'AI-powered personalized storytelling platform for children',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'support@ai-tales.com',
            availableLanguage: ['English'],
        },
        sameAs: [
            'https://facebook.com/aitales',
            'https://twitter.com/aitales',
            'https://instagram.com/aitales',
        ],
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function FAQSchema({ questions }: { questions: Array<{ question: string; answer: string }> }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
            },
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function ArticleSchema({
    title,
    description,
    datePublished,
    dateModified,
    authorName,
    imageUrl,
}: {
    title: string
    description: string
    datePublished: string
    dateModified?: string
    authorName: string
    imageUrl: string
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        image: imageUrl,
        datePublished: datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: 'AI Tales',
            logo: {
                '@type': 'ImageObject',
                url: 'https://ai-tales.com/logo.png',
            },
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function ProductSchema({ 
    name, 
    description, 
    price, 
    priceCurrency = 'USD' 
}: { 
    name: string
    description: string
    price: string
    priceCurrency?: string
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: name,
        description: description,
        brand: {
            '@type': 'Brand',
            name: 'AI Tales',
        },
        offers: {
            '@type': 'Offer',
            price: price,
            priceCurrency: priceCurrency,
            priceValidUntil: '2025-12-31',
            availability: 'https://schema.org/InStock',
            url: 'https://ai-tales.com/pricing',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function ReviewSchema({
    author,
    rating,
    reviewBody,
    datePublished,
}: {
    author: string
    rating: number
    reviewBody: string
    datePublished: string
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: author,
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: rating,
            bestRating: 5,
            worstRating: 1,
        },
        reviewBody: reviewBody,
        datePublished: datePublished,
        itemReviewed: {
            '@type': 'SoftwareApplication',
            name: 'AI Tales',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function HowToSchema({
    name,
    description,
    steps,
}: {
    name: string
    description: string
    steps: Array<{ name: string; text: string }>
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: name,
        description: description,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function BreadcrumbSchema({
    items,
}: {
    items: Array<{ name: string; url: string }>
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
