'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useFavorites, useToggleFavorite } from '@/lib/react-query/hooks'

interface FavoriteButtonProps {
  productId: string
}

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { data: favorites = [], isLoading } = useFavorites()
  const toggleMutation = useToggleFavorite()

  // Check if product is favorited (favorites is an array of products)
  const isFavorited = favorites.some((product: any) => product.id === productId)

  const handleToggle = () => {
    // Immediate optimistic update - UI updates instantly
    toggleMutation.mutate(
      { productId, isFavorited },
      {
        onSuccess: () => {
          toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites', {
            duration: 2000,
          })
        },
        onError: () => {
          toast.error('Failed to update favorites')
        },
      }
    )
  }

  return (
    <Button
      variant="outline"
      className="flex-1 transition-all"
      onClick={handleToggle}
      disabled={toggleMutation.isPending || isLoading}
    >
      <Heart
        className={`mr-2 h-4 w-4 transition-all ${
          isFavorited ? 'fill-red-500 text-red-500 scale-110' : ''
        }`}
      />
      {toggleMutation.isPending
        ? 'Updating...'
        : isFavorited
        ? 'Favorited'
        : 'Add to Favorites'}
    </Button>
  )
}

