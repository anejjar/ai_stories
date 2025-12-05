// API Error handling utilities

import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An error occurred'
): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || defaultMessage,
      },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: defaultMessage,
    },
    { status: 500 }
  )
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  )
}

