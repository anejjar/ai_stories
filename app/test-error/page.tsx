'use client'

export default function TestErrorPage() {
  const triggerError = () => {
    // @ts-ignore
    myUndefinedFunction()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">GlitchTip Test Page</h1>
      <p className="mb-4">Click the button below to trigger a test error.</p>
      <button
        onClick={triggerError}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Trigger Test Error
      </button>
    </div>
  )
}

