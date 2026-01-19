'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationInfo } from '@/types/admin'

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  variant="outline"
                  size="sm"
                  className={`w-10 ${page === pageNum ? 'bg-gray-100 border-gray-400' : 'border-gray-300'}`}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
