'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  TrendingUp,
  Trophy,
  Zap,
  Target,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useUser, useProfileStats } from '@/lib/react-query/hooks'
import { useQueryClient } from '@tanstack/react-query'

export default function ProfilePage() {
  const { data: userData, isLoading: userLoading } = useUser()
  const { data: stats, isLoading: statsLoading } = useProfileStats()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (userData?.name) {
      setName(userData.name)
    }
  }, [userData?.name])

  const loading = userLoading || statsLoading
  const profile = userData

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['user'] })
        setEditing(false)
        toast.success('Profile updated!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { label: 'Master', color: 'bg-purple-100 text-purple-700' }
    if (level >= 5) return { label: 'Pro', color: 'bg-blue-100 text-blue-700' }
    if (level >= 3) return { label: 'Rising', color: 'bg-green-100 text-green-700' }
    return { label: 'Starter', color: 'bg-yellow-100 text-yellow-700' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-charcoal/30" />
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
            <p className="text-charcoal/60">Profile not found</p>
          </div>
        </div>
      </div>
    )
  }

  const xpPercentage = stats ? (stats.xp / stats.nextLevelXp) * 100 : 0
  const badge = stats ? getLevelBadge(stats.level) : getLevelBadge(1)

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-serif text-charcoal">
            <span className="italic">Profile</span>
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-subtle p-8"
          >
            <h2 className="text-lg font-semibold text-charcoal mb-1">Profile Information</h2>
            <p className="text-sm text-charcoal/60 mb-8">Manage your account details</p>

            {/* Avatar & Role */}
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-subtle">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-peach to-orange-300 flex items-center justify-center text-3xl font-bold text-charcoal">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-serif text-charcoal">{profile.name || 'User'}</h2>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-cream rounded-full text-charcoal/70">
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Info Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Name</label>
                {editing ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-subtle bg-cream text-charcoal focus:outline-none focus:ring-2 focus:ring-peach/50 transition-all"
                    />
                    <button
                      onClick={handleSave}
                      className="p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setEditing(false); setName(profile.name || '') }}
                      className="p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-charcoal">{profile.name || 'Not set'}</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 text-sm border border-charcoal/20 text-charcoal rounded-full hover:bg-charcoal/5 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-charcoal/50" />
                  <p className="text-charcoal/70">{profile.email}</p>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Member Since</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-charcoal/50" />
                  <p className="text-charcoal/70">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-subtle p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-charcoal" />
              <h2 className="text-lg font-semibold text-charcoal">Your Stats</h2>
            </div>

            {stats && (
              <div className="space-y-8">
                {/* Level Progress */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-charcoal">Level {stats.level}</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                      ⭐ {badge.label}
                    </span>
                  </div>
                  <div className="w-full bg-cream rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-peach to-orange-400 h-2.5 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-charcoal/50 mt-2">
                    {stats.xp} / {stats.nextLevelXp} XP
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Sparkles, label: 'Generations', value: stats.generations, color: 'text-yellow-500' },
                    { icon: Target, label: 'Collaborations', value: stats.collaborations, color: 'text-blue-500' },
                    { icon: ImageIcon, label: 'Portfolio', value: stats.portfolioItems, color: 'text-green-500' },
                    { icon: Zap, label: 'Level', value: stats.level, color: 'text-purple-500' },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={stat.label}
                        className="group p-4 bg-cream rounded-xl hover:bg-charcoal transition-all cursor-default"
                      >
                        <Icon className={`w-5 h-5 mb-2 ${stat.color} group-hover:text-peach`} />
                        <p className="text-2xl font-bold text-charcoal group-hover:text-cream transition-colors">
                          {stat.value}
                        </p>
                        <p className="text-xs text-charcoal/60 group-hover:text-cream/70 transition-colors">
                          {stat.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
