'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'
import { Download, Loader2, FileText, Crown } from 'lucide-react'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { generatePDFFromHTML, downloadPDF } from '@/lib/pdf/pdf-generator'
import type { Story } from '@/types'

interface PDFExportButtonProps {
  story: Story
}

export function PDFExportButton({ story }: PDFExportButtonProps) {
  const { userProfile, getAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const isFamily = userProfile?.subscriptionTier === 'family'

  const handleExportPDF = async () => {
    if (!isFamily) {
      setShowUpgradeModal(true)
      return
    }

    setLoading(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      // Fetch PDF HTML from API
      const response = await fetch(`/api/stories/${story.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.data?.requiresUpgrade) {
          setShowUpgradeModal(true)
          return
        }
        throw new Error(result.error || 'Failed to generate PDF')
      }

      if (result.success && result.data?.html) {
        // Generate PDF from HTML
        // For illustrated books, use landscape orientation for better book layout
        const isIllustratedBook = story.isIllustratedBook && story.bookPages && story.bookPages.length > 0

        const blob = await generatePDFFromHTML(result.data.html, {
          title: story.title,
          format: 'letter',
          orientation: isIllustratedBook ? 'landscape' : 'portrait',
        })

        // Download PDF
        downloadPDF(blob, result.data.title || `${story.title}.pdf`)

        const message = isIllustratedBook
          ? 'Your illustrated book is ready to print! 📖✨'
          : 'Your story is ready to print or share!'
        toast.success('PDF downloaded! 📄', message)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error(
        'Failed to export PDF',
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleExportPDF}
        disabled={loading}
        variant="outline"
        className={`rounded-full border-2 font-bold ${isFamily
            ? 'border-green-400 hover:bg-green-100 text-green-700'
            : 'border-yellow-400 hover:bg-yellow-100 text-yellow-700 opacity-60'
          }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            {isFamily ? (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF 📄
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Family Plan Feature 👑
              </>
            )}
          </>
        )}
      </Button>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier="family"
      />
    </>
  )
}


