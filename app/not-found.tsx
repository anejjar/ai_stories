import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-8">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 text-6xl animate-float opacity-20">🔍</div>
      <div className="absolute bottom-20 left-10 text-6xl animate-float opacity-20" style={{ animationDelay: '1s' }}>📚</div>
      <div className="absolute top-40 left-20 text-4xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>✨</div>

      <Card className="max-w-lg w-full border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="text-8xl mb-4 animate-bounce-slow">🤔</div>
          <CardTitle className="text-4xl font-bold font-comic bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
            Page Not Found!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-gray-700 font-semibold">
            Looks like this page went on its own adventure! 🗺️
          </p>
          
          <div className="bg-white/60 rounded-2xl p-4 border-2 border-purple-200">
            <p className="text-sm text-gray-600">
              The page you're looking for might have been moved, deleted, or maybe it never existed in the first place. 🧙‍♂️
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/">
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home 🏠
              </Button>
            </Link>
            <Link href="/library">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-2 border-purple-300 hover:bg-purple-100 font-bold w-full sm:w-auto"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Story Library 📚
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

