/**
 * PDF Generation Utilities
 * Client-side PDF generation using jsPDF and html2canvas
 */

import jsPDF from 'jspdf'

export interface PDFOptions {
  title: string
  format?: 'letter' | 'a4'
  orientation?: 'portrait' | 'landscape'
}

/**
 * Generate PDF from HTML content
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFOptions
): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div')
  container.innerHTML = htmlContent
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '800px'
  document.body.appendChild(container)

  try {
    // Use html2canvas to convert HTML to canvas
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'letter',
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = pdf.internal.pageSize.getWidth()
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdf.internal.pageSize.getHeight()

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()
    }

    // Clean up
    document.body.removeChild(container)

    return pdf.output('blob')
  } catch (error) {
    document.body.removeChild(container)
    throw error
  }
}

/**
 * Download PDF blob
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


