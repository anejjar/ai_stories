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
        name: 'Safe AI Stories',
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
            ratingCount: '1247',
            bestRating: '5',
            worstRating: '1',
        },
        description:
            'Create personalized, safe, AI-generated bedtime stories for children in seconds. Age-appropriate, ad-free tales kids love.',
        featureList: [
            'Personalized stories with child\'s name',
            'Age-appropriate content filtering',
            'Unlimited story generation',
            'Ad-free experience',
            'Print or read on screen',
            'Safety-reviewed content',
            'AI-illustrated stories',
            'Text-to-speech audio',
        ],
        author: {
            '@type': 'Organization',
            name: 'Safe AI Stories',
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
        name: 'Safe AI Stories',
        url: 'https://safeaistories.com',
        logo: 'https://safeaistories.com/logo.png',
        description: 'AI-powered personalized bedtime stories for children',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'support@safeaistories.com',
            availableLanguage: ['English'],
        },
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
            name: 'Safe AI Stories',
            logo: {
                '@type': 'ImageObject',
                url: 'https://safeaistories.com/logo.png',
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
