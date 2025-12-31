'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

interface Props {
  email?: string
  onResend: () => Promise<void>
}

export function EmailVerificationRequired({ email, onResend }: Props) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-playwize-orange rounded-[4rem] rotate-1 opacity-5" />
      <Card className="relative border-4 border-gray-100 shadow-2xl bg-white rounded-[3rem] overflow-hidden">
        <div className="h-4 bg-playwize-orange w-full" />
        <CardHeader className="space-y-4 px-10 pt-10 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-20 w-20 rounded-[2rem] bg-orange-50 flex items-center justify-center text-5xl">
              📧
            </div>
          </div>
          <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">
            Verify Your <span className="text-playwize-orange">Email</span>
          </CardTitle>
          <CardDescription className="text-center text-lg text-gray-600 font-medium leading-relaxed">
            Before you can create magical stories, please verify your email address!
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10 space-y-6">
          <div className="p-6 bg-orange-50 border-2 border-orange-100 rounded-[2rem]">
            <p className="text-gray-700 font-medium text-center">
              We sent a verification link to:<br />
              <span className="font-black text-playwize-orange">{email}</span>
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm font-medium text-center">
              Check your inbox and click the verification link to get started!
            </p>
            <p className="text-gray-500 text-xs text-center">
              Don't forget to check your spam folder!
            </p>
          </div>

          <Button
            onClick={onResend}
            variant="outline"
            className="w-full h-14 rounded-full border-2 border-gray-100 font-bold text-base hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend Verification Email
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
