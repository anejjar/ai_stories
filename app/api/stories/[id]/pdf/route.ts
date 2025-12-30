import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'
import { databaseStoryToStory, type DatabaseStory } from '@/types/database'

/**
 * Generate PDF for a story (Family Plan feature)
 * Returns PDF as base64 or blob URL
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    // Get user profile to check subscription tier
    const { data: userProfile } = await (supabaseAdmin
      .from('users') as any)
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    // Check if user has Family Plan access
    if (userProfile.subscription_tier !== 'family') {
      return NextResponse.json(
        { success: false, error: 'Family Plan required to export PDF' },
        { status: 403 }
      )
    }

    // Get the story
    const storyId = params.id
    const { data: story, error: storyError } = await (supabaseAdmin
      .from('stories') as any)
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Story not found',
        },
        { status: 404 }
      )
    }

    const storyData = story as DatabaseStory
    const storyObj = databaseStoryToStory(storyData)

    // Generate PDF HTML template
    const pdfHtml = generatePDFHTML(storyObj)

    // Return HTML that can be converted to PDF on client side
    // For server-side PDF generation, we'd use puppeteer or similar
    // For MVP, we'll return HTML and let client handle conversion
    return NextResponse.json<ApiResponse<{ html: string; title: string }>>({
      success: true,
      data: {
        html: pdfHtml,
        title: `${storyObj.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to generate PDF',
      },
      { status: 500 }
    )
  }
}

/**
 * Generate HTML template for PDF
 */
function generatePDFHTML(story: {
  title: string
  content: string
  childName: string
  theme: string
  adjectives: string[]
  moral?: string
  imageUrls?: string[]
}): string {
  const images = story.imageUrls || []
  const paragraphs = story.content.split('\n').filter((p) => p.trim())

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    body {
      font-family: 'Comic Sans MS', 'Comic Neue', cursive, sans-serif;
      color: #333;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(to bottom, #fff5f5, #f0f9ff);
    }
    .cover {
      text-align: center;
      padding: 60px 20px;
      page-break-after: always;
      background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #6c5ce7 100%);
      color: white;
      border-radius: 20px;
      margin-bottom: 40px;
    }
    .cover h1 {
      font-size: 48px;
      margin: 20px 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .cover .subtitle {
      font-size: 24px;
      margin-top: 20px;
      opacity: 0.9;
    }
    .cover .child-name {
      font-size: 32px;
      margin-top: 30px;
      font-weight: bold;
    }
    .content {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      page-break-before: always;
    }
    .story-image {
      width: 100%;
      max-width: 600px;
      height: auto;
      margin: 30px auto;
      display: block;
      border-radius: 15px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      page-break-inside: avoid;
    }
    .paragraph {
      font-size: 18px;
      margin-bottom: 25px;
      text-align: justify;
      color: #2d3748;
    }
    .moral-box {
      background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
      border: 3px solid #f39c12;
      border-radius: 15px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .moral-box p {
      font-size: 20px;
      font-weight: bold;
      color: #2d3436;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 3px solid #ff6b9d;
      color: #666;
      font-size: 16px;
    }
    @media print {
      body {
        background: white;
      }
      .cover {
        background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #6c5ce7 100%);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${escapeHtml(story.title)}</h1>
    <div class="subtitle">A Magical Story</div>
    <div class="child-name">For ${escapeHtml(story.childName)} ✨</div>
  </div>

  <div class="content">
    ${images.map(
    (img, index) => `
      <img src="${img}" alt="Story illustration ${index + 1}" class="story-image" />
    `
  ).join('')}

    ${paragraphs
      .map(
        (para) => `
      <div class="paragraph">${escapeHtml(para)}</div>
    `
      )
      .join('')}

    ${story.moral
      ? `
    <div class="moral-box">
      <p>💡 Lesson: ${escapeHtml(story.moral)}</p>
    </div>
    `
      : ''}

    <div class="footer">
      <p>📚 The End 🎉</p>
      <p>A story created with love for ${escapeHtml(story.childName)}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}


