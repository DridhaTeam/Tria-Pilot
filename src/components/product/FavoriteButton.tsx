'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  productId: string
}

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if product is favorited
    fetch('/api/favorites')
      .then((res) => res.json())
      .then((favorites) => {
        const favorited = favorites.some((f: any) => f.id === productId)
        setIsFavorited(favorited)
      })
      .catch(() => {})
  }, [productId])

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isFavorited) {
        const response = await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setIsFavorited(false)
          toast.success('Removed from favorites')
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (response.ok) {
          setIsFavorited(true)
          toast.success('Added to favorites')
        }
      }
    } catch (error) {
      toast.error('Failed to update favorites')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="flex-1"
      onClick={handleToggle}
      disabled={loading}
    >
      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
      {isFavorited ? 'Favorited' : 'Add to Favorites'}
    </Button>
  )
}

