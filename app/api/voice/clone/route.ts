import { NextRequest, NextResponse } from 'next/server'

// Voice cloning feature is disabled until core features are production ready
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Voice cloning feature is temporarily disabled',
      message: 'This feature will be available once core features are production ready'
    },
    { status: 503 }
  )
}
