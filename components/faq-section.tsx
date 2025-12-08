'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { FAQSchema } from '@/components/schema/schema-markup'

const faqData = [
    {
        question: 'Are AI-generated bedtime stories safe for children?',
        answer:
            'Yes, when using reputable platforms with proper safety filters. Safe AI Stories employs multiple layers of content filtering, age-appropriate language controls, and human oversight to ensure every story is wholesome and suitable for children. Always choose platforms that are transparent about their safety measures and privacy policies.',
    },
    {
        question: 'How personalized can the stories get?',
        answer:
            "Very personalized! Our bedtime story generator allows you to include your child's name, age, favorite activities, pets, friends' names, current challenges, and specific interests. The AI weaves these elements naturally into engaging narratives that feel tailor-made for your child.",
    },
    {
        question: 'Will my child get bored of AI stories?',
        answer:
            'The beauty of AI generation is infinite variety. Unlike physical books you read repeatedly, each AI bedtime story is completely unique. You can generate a new story every single night, exploring different themes, settings, and adventures. Many parents report their children become more excited about bedtime because they never know what story they\'ll hear.',
    },
    {
        question: 'Can AI stories help with specific parenting challenges?',
        answer:
            'Absolutely. Many parents use custom bedtime stories to address fears (darkness, monsters, separation anxiety), upcoming changes (new sibling, moving, starting school), or behavioral lessons (sharing, kindness, honesty). Stories provide a gentle, non-confrontational way to help children process emotions and learn important concepts.',
    },
    {
        question: 'How long does it take to generate a story?',
        answer:
            'Most quality AI story generators for kids create complete, personalized stories in 15-30 seconds. You input the basic details, click generate, and within moments have a ready-to-read tale. This makes it perfect even on rushed evenings when you\'re short on time.',
    },
    {
        question: 'Do I need to be tech-savvy to use an AI bedtime story generator?',
        answer:
            'Not at all. Safe AI Stories is designed for exhausted parents at the end of a long day. If you can send a text message, you can create a personalized bedtime story. The interface is simple, intuitive, and requires just a few clicks or taps.',
    },
    {
        question: 'Can I save and reuse favorite stories?',
        answer:
            'Yes! Our platform allows you to save stories your child particularly loves. While the joy is often in the novelty, some children do develop favorites they want to hear again, just like traditional books. You can build a personalized library of your child\'s favorite tales.',
    },
    {
        question: 'Are AI bedtime stories educational?',
        answer:
            'They can be. You can request stories that teach counting, colors, problem-solving, emotional intelligence, or other concepts. The narrative format makes learning natural and enjoyable rather than feeling like a lesson. Many parents use our stories to reinforce values and life skills.',
    },
    {
        question: 'How much do AI bedtime story services cost?',
        answer:
            'Safe AI Stories offers a free trial with 1 free story so you can test before committing. Our PRO plan is $9.99/month for unlimited text stories, and PRO MAX is $19.99/month for unlimited illustrated stories—less than the cost of a few children\'s books, but with infinite variety.',
    },
    {
        question: 'Can I print the stories or only read them on screen?',
        answer:
            'We offer multiple options: read on-screen, download as PDF for printing, or save to create a personalized storybook collection. This flexibility means you can choose screen-free bedtime while still using AI technology. PRO MAX members can even get high-resolution illustrated PDFs perfect for printing.',
    },
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="relative z-10 py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <FAQSchema questions={faqData} />
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Frequently Asked Questions About AI Bedtime Stories
                    </h2>
                    <p className="text-xl text-gray-600 font-semibold">
                        Everything parents want to know about personalized AI story generation
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <Card
                            key={index}
                            className="border-2 border-pink-200 bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                            onClick={() => toggleFAQ(index)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-gray-800 pr-4">
                                        {faq.question}
                                    </CardTitle>
                                    <ChevronDown
                                        className={`h-5 w-5 text-pink-600 flex-shrink-0 transition-transform ${openIndex === index ? 'transform rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </CardHeader>
                            {openIndex === index && (
                                <CardContent className="pt-0">
                                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-600 font-medium">
                        Have more questions?{' '}
                        <a href="/signup" className="text-pink-600 font-bold hover:underline">
                            Try it free
                        </a>{' '}
                        and see for yourself!
                    </p>
                </div>
            </div>
        </section>
    )
}
