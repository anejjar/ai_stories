/**
 * Child Profile Manager Component - FAMILY PLAN Feature
 * Allows parents to create and manage profiles for their children
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BirthdayPicker } from '@/components/ui/birthday-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Crown,
  Shield,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Wand2
} from 'lucide-react'
import type { ChildProfile, ChildAppearance } from '@/types'

import { ChildImageUploadModal } from './child-image-upload-modal'

export function ChildProfileManager() {
  const { userProfile, getAccessToken } = useAuth()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Image upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadProfileId, setUploadProfileId] = useState<string | null>(null)

  // Form state for creating profile
  const [formName, setFormName] = useState('')
  const [formNickname, setFormNickname] = useState('')
  const [formBirthDate, setFormBirthDate] = useState<Date | undefined>(undefined)
  const [formSkinTone, setFormSkinTone] = useState('none')
  const [formHairColor, setFormHairColor] = useState('none')
  const [formHairStyle, setFormHairStyle] = useState('none')

  // Edit form state
  const [editingBirthDate, setEditingBirthDate] = useState<Date | undefined>(undefined)

  const isFamily = userProfile?.subscriptionTier === 'family'

  useEffect(() => {
    if (isFamily) {
      fetchProfiles()
    }
  }, [isFamily])

  const fetchProfiles = async () => {
    if (!isFamily) return

    setLoading(true)
    setError('')

    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Failed to get access token')

      const response = await fetch('/api/child-profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch profiles')
      }

      setProfiles(data.data.profiles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load child profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Failed to get access token')

      if (!formName || !formName.trim()) {
        throw new Error('Child name is required')
      }

      const appearance: ChildAppearance = {}
      if (formSkinTone && formSkinTone !== 'none') appearance.skinTone = formSkinTone
      if (formHairColor && formHairColor !== 'none') appearance.hairColor = formHairColor
      if (formHairStyle && formHairStyle !== 'none') appearance.hairStyle = formHairStyle

      const response = await fetch('/api/child-profiles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName.trim(),
          nickname: formNickname?.trim() || undefined,
          birthDate: formBirthDate ? formBirthDate.toISOString().split('T')[0] : undefined,
          appearance: Object.keys(appearance).length > 0 ? appearance : undefined,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create profile')
      }

      setSuccess('Child profile created successfully!')
      setShowCreateForm(false)
      // Reset form state
      setFormName('')
      setFormNickname('')
      setFormBirthDate(undefined)
      setFormSkinTone('none')
      setFormHairColor('none')
      setFormHairStyle('none')
      await fetchProfiles()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this child profile?')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Failed to get access token')

      const response = await fetch(`/api/child-profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete profile')
      }

      setSuccess('Child profile deleted successfully!')
      await fetchProfiles()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile')
    }
  }

  const handleEditProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId)
    if (profile) {
      setEditingProfile(profile)
      setEditingId(profileId)
      setEditingBirthDate(profile.birthDate ? new Date(profile.birthDate) : undefined)
      setShowCreateForm(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Capture form element immediately before any async operations
    const form = e.currentTarget

    console.log('handleUpdateProfile called')
    console.log('editingId:', editingId)
    console.log('editingProfile:', editingProfile)
    console.log('editingBirthDate:', editingBirthDate)

    if (!editingId || !editingProfile) return

    setError('')
    setSuccess('')

    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Failed to get access token')

      const formData = new FormData(form)
      const name = formData.get('name') as string
      const nickname = formData.get('nickname') as string

      // Get Select values from the form
      const skinToneSelect = form.querySelector('[name="skinTone"]') as HTMLSelectElement
      const hairColorSelect = form.querySelector('[name="hairColor"]') as HTMLSelectElement
      const hairStyleSelect = form.querySelector('[name="hairStyle"]') as HTMLSelectElement

      const skinTone = skinToneSelect?.value || 'none'
      const hairColor = hairColorSelect?.value || 'none'
      const hairStyle = hairStyleSelect?.value || 'none'

      if (!name || !name.trim()) {
        throw new Error('Child name is required')
      }

      const appearance: ChildAppearance = {}
      if (skinTone && skinTone !== 'none') appearance.skinTone = skinTone
      if (hairColor && hairColor !== 'none') appearance.hairColor = hairColor
      if (hairStyle && hairStyle !== 'none') appearance.hairStyle = hairStyle

      const requestBody = {
        name: name.trim(),
        nickname: nickname?.trim() || undefined,
        birthDate: editingBirthDate ? editingBirthDate.toISOString().split('T')[0] : undefined,
        appearance: Object.keys(appearance).length > 0 ? appearance : undefined,
      }

      console.log('Request body:', requestBody)

      const response = await fetch(`/api/child-profiles/${editingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log('Response:', data)

      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Child profile updated successfully!')
      setEditingId(null)
      setEditingProfile(null)
      await fetchProfiles()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingProfile(null)
    setEditingBirthDate(undefined)
  }

  const handleImageUploadClick = (profileId: string) => {
    setUploadProfileId(profileId)
    setUploadModalOpen(true)
  }

  const handleUploadSuccess = async () => {
    setSuccess('Profile picture updated successfully!')
    await fetchProfiles()
    setUploadModalOpen(false)
    setUploadProfileId(null)
    setTimeout(() => setSuccess(''), 5000)
  }

  if (!isFamily) {
    return (
      <Card className="border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Child Profiles 👨‍👩‍👧‍👦
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-gray-700 font-semibold mb-4">
              Upgrade to FAMILY PLAN to create and manage profiles for your children!
            </p>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold">
              FAMILY PLAN Feature 👑
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 shadow-2xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 text-6xl opacity-10 animate-float">👶</div>
      <div className="absolute bottom-0 left-0 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🌟</div>

      <CardHeader className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 border-b-4 border-purple-300 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full shadow-lg">
              <Crown className="h-7 w-7 text-purple-600 animate-sparkle" />
            </div>
            <CardTitle className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
              Child Profiles 👨‍👩‍👧‍👦
            </CardTitle>
          </div>
          {profiles.length > 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:from-pink-600 hover:via-purple-600 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Child
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 relative z-10">
        {/* Safety Notice */}
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-4 border-blue-400 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20 animate-bounce-slow">🛡️</div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-blue-100 rounded-full shadow-md">
              <Shield className="h-7 w-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2 text-lg flex items-center gap-2">
                🔒 Image Safety & Privacy
              </h3>
              <p className="text-sm text-blue-800 font-semibold leading-relaxed">
                <strong>Important:</strong> When you upload a photo of your child, the original image is processed by AI
                to create a safe, stylized version. <strong>The original image is never stored or uploaded.</strong> Only
                the AI-generated version is saved. This ensures maximum privacy and safety for your children. ✨
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-400 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="p-2 bg-green-200 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-700" />
            </div>
            <p className="text-sm font-bold text-green-800 flex-1">{success}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess('')}
              className="rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-100 to-pink-100 border-4 border-red-400 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="p-2 bg-red-200 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-700" />
            </div>
            <p className="text-sm font-bold text-red-800 flex-1">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Edit Form */}
        {editingId && editingProfile && (
          <Card className="mb-6 border-4 border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 shadow-xl rounded-2xl animate-in fade-in slide-in-from-top-2">
            <CardHeader className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-t-xl border-b-4 border-purple-300">
              <CardTitle className="text-xl font-bold flex items-center justify-between text-purple-800">
                <span className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Child Profile ✏️
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEdit}
                  className="rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                      <span>👤</span>
                      Child's Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="name"
                      required
                      defaultValue={editingProfile.name}
                      placeholder="Enter child's name"
                      className="rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                      <span>✨</span>
                      Nickname (Optional)
                    </label>
                    <Input
                      name="nickname"
                      defaultValue={editingProfile.nickname || ''}
                      placeholder="Enter nickname"
                      className="rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                      <span>🎂</span>
                      Birth Date (Optional)
                    </label>
                    <BirthdayPicker
                      date={editingBirthDate}
                      onDateChange={setEditingBirthDate}
                      placeholder="Select birth date"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                      <span>🎨</span>
                      Appearance (for story illustrations)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Skin Tone</label>
                        <Select name="skinTone" defaultValue={editingProfile.appearance?.skinTone || 'none'}>
                          <SelectTrigger className="rounded-xl border-3 border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not specified</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium-light">Medium-Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Hair Color</label>
                        <Select name="hairColor" defaultValue={editingProfile.appearance?.hairColor || 'none'}>
                          <SelectTrigger className="rounded-xl border-3 border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not specified</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="blonde">Blonde</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="auburn">Auburn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Hair Style</label>
                        <Select name="hairStyle" defaultValue={editingProfile.appearance?.hairStyle || 'none'}>
                          <SelectTrigger className="rounded-xl border-3 border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not specified</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="curly">Curly</SelectItem>
                            <SelectItem value="wavy">Wavy</SelectItem>
                            <SelectItem value="straight">Straight</SelectItem>
                            <SelectItem value="braided">Braided</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:from-pink-600 hover:via-purple-600 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      ✨ Update Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="rounded-full border-2 hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Form */}
        {showCreateForm && !editingId && (
          <Card className="mb-6 border-4 border-pink-400 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 shadow-xl rounded-2xl animate-in fade-in slide-in-from-top-2">
            <CardHeader className="bg-gradient-to-r from-pink-200 to-purple-200 rounded-t-xl border-b-4 border-pink-300">
              <CardTitle className="text-xl font-bold flex items-center justify-between text-pink-800">
                <span className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Child Profile ✨
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProfile} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <span>👤</span>
                    Child's Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter child's name"
                    className="rounded-xl border-2 border-pink-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <span>✨</span>
                    Nickname (Optional)
                  </label>
                  <Input
                    name="nickname"
                    value={formNickname}
                    onChange={(e) => setFormNickname(e.target.value)}
                    placeholder="Enter nickname"
                    className="rounded-xl border-2 border-pink-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <span>🎂</span>
                    Birth Date (Optional)
                  </label>
                  <BirthdayPicker
                    date={formBirthDate}
                    onDateChange={setFormBirthDate}
                    placeholder="Select birth date"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                    <span>🎨</span>
                    Appearance (for story illustrations)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block">Skin Tone</label>
                      <Select name="skinTone" value={formSkinTone} onValueChange={setFormSkinTone}>
                        <SelectTrigger className="rounded-xl border-3 border-pink-300 focus:border-pink-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="medium-light">Medium-Light</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block">Hair Color</label>
                      <Select name="hairColor" value={formHairColor} onValueChange={setFormHairColor}>
                        <SelectTrigger className="rounded-xl border-3 border-pink-300 focus:border-pink-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="brown">Brown</SelectItem>
                          <SelectItem value="blonde">Blonde</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="auburn">Auburn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block">Hair Style</label>
                      <Select name="hairStyle" value={formHairStyle} onValueChange={setFormHairStyle}>
                        <SelectTrigger className="rounded-xl border-3 border-pink-300 focus:border-pink-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="curly">Curly</SelectItem>
                          <SelectItem value="wavy">Wavy</SelectItem>
                          <SelectItem value="straight">Straight</SelectItem>
                          <SelectItem value="braided">Braided</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:from-pink-600 hover:via-purple-600 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    ✨ Create Profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-full border-2 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Profiles List */}
        {loading ? (
          <div className="text-center p-12">
            <div className="relative inline-block">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl animate-bounce-slow">👶</span>
              </div>
            </div>
            <p className="text-gray-600 font-bold text-lg mt-4">Loading profiles...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait ✨</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center p-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-4 border-purple-200 border-dashed">
            <div className="text-6xl mb-4 animate-bounce-slow">👶</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No child profiles yet!</h3>
            <p className="text-gray-600 font-semibold mb-6">
              Create your first profile to get started with personalized stories! ✨
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 hover:from-pink-600 hover:via-purple-600 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-6 text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Profile
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profiles.map((profile, index) => (
              <Card
                key={profile.id}
                className="border-4 border-purple-300 bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6 p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Profile Image */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      {profile.aiGeneratedImageUrl ? (
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200 flex items-center justify-center border-4 border-purple-400 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={profile.aiGeneratedImageUrl}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200 flex items-center justify-center border-4 border-purple-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <span className="text-4xl animate-bounce-slow">👶</span>
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {profile.name}
                        </h3>
                        {profile.nickname && (
                          <span className="text-sm text-gray-600 font-semibold bg-purple-100 px-2 py-1 rounded-full">
                            "{profile.nickname}"
                          </span>
                        )}
                      </div>
                      {profile.birthDate && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <p className="text-xs text-gray-600 font-semibold mb-1">🎂 Birth Date</p>
                          <p className="text-sm font-bold text-gray-800">
                            {new Date(profile.birthDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      {profile.appearance && Object.keys(profile.appearance).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                          {profile.appearance.skinTone && (
                            <Badge className="bg-gradient-to-r from-orange-200 to-yellow-200 text-orange-800 border-2 border-orange-300 font-semibold">
                              {profile.appearance.skinTone} skin
                            </Badge>
                          )}
                          {profile.appearance.hairColor && (
                            <Badge className="bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800 border-2 border-amber-300 font-semibold">
                              {profile.appearance.hairColor} hair
                            </Badge>
                          )}
                          {profile.appearance.hairStyle && (
                            <Badge className="bg-gradient-to-r from-pink-200 to-purple-200 text-pink-800 border-2 border-pink-300 font-semibold">
                              {profile.appearance.hairStyle} style
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-purple-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[120px] rounded-full border-2 border-purple-300 hover:bg-purple-100 hover:border-purple-400 transition-all"
                      onClick={() => handleImageUploadClick(profile.id)}
                    >
                      <Wand2 className="h-4 w-4 mr-1 text-purple-600" />
                      Magic Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px] rounded-full border-2 border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all"
                      onClick={() => handleEditProfile(profile.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px] rounded-full border-2 border-red-300 hover:bg-red-100 hover:border-red-400 text-red-600 hover:text-red-700 transition-all"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Image Upload Modal */}
        {uploadProfileId && (
          <ChildImageUploadModal
            isOpen={uploadModalOpen}
            onClose={() => {
              setUploadModalOpen(false)
              setUploadProfileId(null)
            }}
            profileId={uploadProfileId}
            childName={profiles.find(p => p.id === uploadProfileId)?.name || 'Child'}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </CardContent>
    </Card>
  )
}

