'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EnvCheck {
  checks: {
    [key: string]: {
      status: string
      note?: string
      [key: string]: any
    }
  }
  summary: {
    core: boolean
    features: {
      [key: string]: boolean
    }
  }
  ready: boolean
  timestamp: string
}

export default function EnvironmentCheckPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EnvCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/debug/env-check')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check environment')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check environment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
        return 'bg-green-50 border-green-200'
      case 'partial':
        return 'bg-yellow-50 border-yellow-200'
      case 'missing':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchStatus} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Environment Configuration</h1>
            <p className="text-gray-600">Check status of required services and API keys</p>
          </div>
          <Button onClick={fetchStatus} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Overall Status */}
        <div
          className={`rounded-lg border-2 p-6 ${
            data.ready
              ? 'bg-green-50 border-green-300'
              : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {data.ready ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            )}
            <div>
              <h2 className="text-xl font-bold">
                {data.ready ? 'Core Services Ready' : 'Configuration Incomplete'}
              </h2>
              <p className="text-sm text-gray-700">
                {data.ready
                  ? 'All core services are configured. Optional features may need setup.'
                  : 'Some core services are missing. Check configuration below.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Checks */}
      <div className="space-y-4">
        {Object.entries(data.checks).map(([key, service]) => (
          <div
            key={key}
            className={`rounded-lg border-2 p-6 ${getStatusColor(service.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(service.status)}
                  <h3 className="text-lg font-bold capitalize">{key}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      service.status === 'configured'
                        ? 'bg-green-200 text-green-800'
                        : service.status === 'partial'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                {service.note && (
                  <p className="text-sm text-gray-700 mb-3">{service.note}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(service).map(([subKey, value]) => {
                    if (subKey === 'status' || subKey === 'note') return null
                    return (
                      <div key={subKey} className="flex items-center gap-2">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        ) : null}
                        <span className="text-gray-700">
                          {subKey}: {String(value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Summary */}
      <div className="mt-8 bg-white rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4">Feature Availability</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.summary.features).map(([feature, available]) => (
            <div key={feature} className="flex items-center gap-3">
              {available ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-700 capitalize">
                {feature.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">Setup Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Copy .env.example to .env.local</li>
          <li>2. Fill in all required API keys and configuration</li>
          <li>3. Restart your development server</li>
          <li>4. Refresh this page to verify configuration</li>
          <li>
            5. See{' '}
            <a
              href="/VOICE_AND_EMAIL_SETUP.md"
              className="underline font-semibold"
              target="_blank"
            >
              VOICE_AND_EMAIL_SETUP.md
            </a>{' '}
            for detailed instructions
          </li>
        </ul>
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Last checked: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  )
}
