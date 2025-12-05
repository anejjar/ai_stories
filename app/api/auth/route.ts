import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  // Auth endpoint placeholder
  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Auth endpoint',
  })
}

export async function POST(request: NextRequest) {
  // Auth endpoint placeholder
  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Auth endpoint',
  })
}

