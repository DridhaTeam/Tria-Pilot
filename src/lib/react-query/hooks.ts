'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// User data hook
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) throw new Error('Failed to fetch user')
      const data = await res.json()
      return data.user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change often
  })
}

// Notifications hook
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    },
    staleTime: 10 * 1000, // 10 seconds - notifications update frequently
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  })
}

// Mark notification as read mutation
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Mark all notifications as read mutation
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark all as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Products hook with filters
export function useProducts(filters?: { brandId?: string; category?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.brandId) params.set('brandId', filters.brandId)
  if (filters?.category) params.set('category', filters.category)
  if (filters?.search) params.set('search', filters.search)

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      return data.data || data
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Single product hook
export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null
      const res = await fetch(`/api/products?id=${productId}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      return res.json()
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Product recommendations hook
export function useProductRecommendations(productId: string | null) {
  return useQuery({
    queryKey: ['product-recommendations', productId],
    queryFn: async () => {
      if (!productId) return []
      const res = await fetch(`/api/products/recommend?productId=${productId}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
  })
}

// Profile stats hook
export function useProfileStats() {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const res = await fetch('/api/profile/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Favorites hook
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites')
      if (!res.ok) throw new Error('Failed to fetch favorites')
      return res.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

