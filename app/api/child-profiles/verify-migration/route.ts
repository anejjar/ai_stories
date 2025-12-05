/**
 * Migration Verification API
 * Checks if the child_profiles table exists and is properly configured
 * This endpoint can be called without authentication to verify migration status
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'

export async function GET() {
  try {
    // Try to query the child_profiles table
    // This will fail if the table doesn't exist
    const { data, error } = await supabaseAdmin
      .from('child_profiles')
      .select('id')
      .limit(0) // Just check if table exists, don't fetch data

    if (error) {
      // Check if error is because table doesn't exist
      // PostgreSQL error code 42P01 = undefined_table
      if (
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.toLowerCase().includes('relation') ||
        error.message?.toLowerCase().includes('table')
      ) {
        return NextResponse.json<ApiResponse<{ migrationStatus: 'not_applied'; errorCode?: string; errorMessage?: string }>>({
          success: false,
          error: 'Migration not applied: child_profiles table does not exist',
          data: {
            migrationStatus: 'not_applied',
            errorCode: error.code,
            errorMessage: error.message,
          },
        })
      }

      // Other database errors
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Database error: ${error.message}`,
        data: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, { status: 500 })
    }

    // Table exists! Try to verify structure by selecting all columns
    // This will fail if columns are missing
    const { error: structureError } = await supabaseAdmin
      .from('child_profiles')
      .select('id, user_id, name, nickname, birth_date, appearance, ai_generated_image_url, original_image_uploaded_at, created_at, updated_at')
      .limit(0)

    if (structureError) {
      return NextResponse.json<ApiResponse<{ migrationStatus: 'partial'; errorMessage?: string }>>({
        success: false,
        error: 'Table exists but structure may be incomplete',
        data: {
          migrationStatus: 'partial',
          errorMessage: structureError.message,
        },
      })
    }

    return NextResponse.json<ApiResponse<{
      migrationStatus: 'applied'
      tableExists: boolean
      structureValid: boolean
    }>>({
      success: true,
      message: 'Migration verified successfully! The child_profiles table exists and has the correct structure.',
      data: {
        migrationStatus: 'applied',
        tableExists: true,
        structureValid: true,
      },
    })
  } catch (error: any) {
    console.error('Error verifying migration:', error)

    // If it's a table doesn't exist error
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      return NextResponse.json<ApiResponse<{ migrationStatus: 'not_applied'; errorCode?: string; errorMessage?: string }>>({
        success: false,
        error: 'Migration not applied: child_profiles table does not exist',
        data: { migrationStatus: 'not_applied' },
      })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: `Verification failed: ${error.message}`,
    }, { status: 500 })
  }
}

