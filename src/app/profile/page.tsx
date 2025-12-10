'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Calendar,
  Loader2,
  Image as ImageIcon,
  TrendingUp,
  Trophy,
  Zap,
  Target,
  Check,
  X,
  Camera,
  Edit3,
  Shield,
  Star,
  Award,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { useUser, useProfileStats } from '@/lib/react-query/hooks'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: userData, isLoading: userLoading } = useUser()
  const { data: stats, isLoading: statsLoading } = useProfileStats()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userData?.name) {
      setName(userData.name)
    }
  }, [userData?.name])

  const loading = userLoading || statsLoading
  const profile = userData

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['user'] })
        setEditing(false)
        toast.success('Profile updated successfully')
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getLevelInfo = (level: number) => {
    if (level >= 10) return { label: 'Master', color: 'bg-purple-500', textColor: 'text-purple-600', bgColor: 'bg-purple-50', icon: Award }
    if (level >= 7) return { label: 'Expert', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', icon: Star }
    if (level >= 5) return { label: 'Pro', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: Trophy }
    if (level >= 3) return { label: 'Rising', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50', icon: TrendingUp }
    return { label: 'Starter', color: 'bg-gray-400', textColor: 'text-gray-600', bgColor: 'bg-gray-50', icon: Zap }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently joined'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Recently joined'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Recently joined'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-charcoal/30" />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-subtle p-16 text-center">
            <User className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
            <p className="text-charcoal/60 mb-4">Profile not found</p>
            <Link href="/login" className="text-peach hover:underline">
              Please log in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const xpPercentage = stats ? Math.min((stats.xp / stats.nextLevelXp) * 100, 100) : 0
  const levelInfo = stats ? getLevelInfo(stats.level) : getLevelInfo(1)
  const LevelIcon = levelInfo.icon

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal">
            Your <span className="italic">Profile</span>
          </h1>
          <p className="text-charcoal/60 mt-2">Manage your account and view your progress</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl border border-subtle overflow-hidden">
              {/* Cover gradient */}
              <div className="h-32 bg-gradient-to-r from-peach via-rose/60 to-orange-300 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              </div>

              {/* Avatar and basic info */}
              <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-peach to-orange-400 flex items-center justify-center text-5xl font-bold text-white shadow-xl border-4 border-white">
                      {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-charcoal text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-charcoal/80 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name and role */}
                  <div className="flex-1 pt-4 sm:pt-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-serif text-charcoal">
                          {profile.name || 'Set your name'}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-charcoal/5 rounded-full text-charcoal/70">
                            <Shield className="w-3.5 h-3.5" />
                            {profile.role === 'INFLUENCER' ? 'Influencer' : 'Brand'}
                          </span>
                          {stats && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${levelInfo.bgColor} ${levelInfo.textColor}`}>
                              <LevelIcon className="w-3.5 h-3.5" />
                              {levelInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/settings"
                        className="p-2 text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 rounded-xl transition-all"
                      >
                        <Settings className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white rounded-3xl border border-subtle p-8">
              <h3 className="text-lg font-semibold text-charcoal mb-6">Account Details</h3>

              <div className="space-y-6">
                {/* Name Field */}
                <div className="flex items-start justify-between gap-4 p-4 bg-cream/50 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-charcoal/60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal/60 mb-1">Display Name</label>
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-subtle bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-peach/50 transition-all min-w-[200px]"
                            autoFocus
                          />
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => { setEditing(false); setName(profile.name || '') }}
                            className="p-2 bg-charcoal/10 text-charcoal rounded-lg hover:bg-charcoal/20 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-charcoal font-medium">{profile.name || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal/70 bg-white border border-charcoal/10 rounded-xl hover:bg-charcoal hover:text-cream transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {/* Email Field */}
                <div className="flex items-start gap-4 p-4 bg-cream/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-charcoal/60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/60 mb-1">Email Address</label>
                    <p className="text-charcoal font-medium">{profile.email}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-4 p-4 bg-cream/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-charcoal/60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/60 mb-1">Member Since</label>
                    <p className="text-charcoal font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Level Card */}
            {stats && (
              <div className="bg-white rounded-3xl border border-subtle p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-charcoal">Your Level</h3>
                  <div className={`w-10 h-10 rounded-xl ${levelInfo.color} flex items-center justify-center`}>
                    <LevelIcon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Level display */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-charcoal mb-1">{stats.level}</div>
                  <div className={`text-sm font-medium ${levelInfo.textColor}`}>{levelInfo.label}</div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/60">Progress</span>
                    <span className="font-medium text-charcoal">{stats.xp} / {stats.nextLevelXp} XP</span>
                  </div>
                  <div className="w-full bg-cream rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className={`h-full rounded-full ${levelInfo.color}`}
                    />
                  </div>
                  <p className="text-xs text-charcoal/50 text-center">
                    {stats.nextLevelXp - stats.xp} XP until next level
                  </p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="bg-white rounded-3xl border border-subtle p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-6">Activity Stats</h3>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100"
                  >
                    <Zap className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{stats.generations}</p>
                    <p className="text-xs text-charcoal/60">Try-Ons</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
                  >
                    <Target className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{stats.collaborations}</p>
                    <p className="text-xs text-charcoal/60">Collabs</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100"
                  >
                    <ImageIcon className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{stats.portfolioItems}</p>
                    <p className="text-xs text-charcoal/60">Portfolio</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                  >
                    <Star className="w-5 h-5 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-charcoal">{stats.xp}</p>
                    <p className="text-xs text-charcoal/60">Total XP</p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-subtle p-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/influencer/try-on"
                  className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-peach/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-peach/20 flex items-center justify-center group-hover:bg-peach/30 transition-colors">
                    <Camera className="w-5 h-5 text-peach" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Try-On Studio</p>
                    <p className="text-xs text-charcoal/60">Create virtual try-ons</p>
                  </div>
                </Link>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Marketplace</p>
                    <p className="text-xs text-charcoal/60">Browse products</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
