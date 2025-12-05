'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Printer, X } from 'lucide-react'
import type { Story } from '@/types'

interface PrintStoryButtonProps {
  story: Story
}

export function PrintStoryButton({ story }: PrintStoryButtonProps) {
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    // Open a new window with print-friendly content
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      alert('Please allow pop-ups to print the story.')
      return
    }

    // Get child names
    const childNames = story.children && story.children.length > 0
      ? story.children.map((c: any) => c.name).join(' & ')
      : story.childName || 'Child'

    // Get adjectives
    const adjectives = story.children && story.children.length > 0
      ? story.children.flatMap((c: any) => c.adjectives).join(', ')
      : story.adjectives.join(', ')

    // Build image HTML if images exist
    const imagesHtml = story.imageUrls && story.imageUrls.length > 0
      ? story.imageUrls.map((url, idx) => `
        <div class="image-container">
          <img src="${url}" alt="Story illustration ${idx + 1}" />
          <p class="image-caption">Illustration ${idx + 1}</p>
        </div>
      `).join('')
      : ''

    // Format story content
    const formattedContent = story.content
      .split('\n')
      .filter(p => p.trim())
      .map(p => `<p>${p}</p>`)
      .join('')

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${story.title} - AI Stories</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Merriweather:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Merriweather', Georgia, serif;
            line-height: 1.8;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #e5b3fe;
          }
          
          .title {
            font-family: 'Comic Neue', cursive;
            font-size: 32px;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 16px;
          }
          
          .meta {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%);
            color: white;
          }
          
          .badge.theme {
            background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          }
          
          .for-child {
            font-size: 16px;
            color: #666;
            margin-top: 8px;
          }
          
          .for-child strong {
            color: #7c3aed;
          }
          
          .moral {
            background: #fef3c7;
            border: 2px solid #fcd34d;
            border-radius: 12px;
            padding: 16px 20px;
            margin: 20px auto;
            max-width: 500px;
            text-align: center;
          }
          
          .moral-label {
            font-weight: 700;
            color: #92400e;
          }
          
          .content {
            margin: 40px 0;
          }
          
          .content p {
            margin-bottom: 24px;
            font-size: 18px;
            text-indent: 30px;
            text-align: justify;
          }
          
          .content p:first-child::first-letter {
            font-size: 48px;
            font-weight: 700;
            float: left;
            line-height: 1;
            padding-right: 10px;
            color: #7c3aed;
          }
          
          .image-container {
            text-align: center;
            margin: 30px 0;
            page-break-inside: avoid;
          }
          
          .image-container img {
            max-width: 100%;
            max-height: 400px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          
          .image-caption {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            font-style: italic;
          }
          
          .ending {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 3px solid #e5b3fe;
          }
          
          .ending-text {
            font-family: 'Comic Neue', cursive;
            font-size: 24px;
            font-weight: 700;
            color: #7c3aed;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .image-container {
              page-break-inside: avoid;
            }
            
            .content p {
              orphans: 3;
              widows: 3;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${story.title}</h1>
          <div class="meta">
            <span class="badge theme">${story.theme}</span>
            ${adjectives.split(', ').map(adj => `<span class="badge">${adj}</span>`).join('')}
          </div>
          <p class="for-child">A story for <strong>${childNames}</strong></p>
          ${story.moral ? `
            <div class="moral">
              <span class="moral-label">💡 Lesson:</span> ${story.moral}
            </div>
          ` : ''}
        </div>
        
        ${imagesHtml ? `<div class="images">${imagesHtml}</div>` : ''}
        
        <div class="content">
          ${formattedContent}
        </div>
        
        <div class="ending">
          <p class="ending-text">✨ The End ✨</p>
        </div>
        
        <div class="footer">
          <p>Created with AI Stories • ${new Date().toLocaleDateString()}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 rounded-full border-2 border-green-300 hover:bg-green-100 font-bold"
    >
      <Printer className="h-4 w-4" />
      Print 🖨️
    </Button>
  )
}

