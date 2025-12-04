'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductRecommendations } from '@/lib/react-query/hooks'

interface ProductRecommendationsProps {
  productId: string
}

export default function ProductRecommendations({ productId }: ProductRecommendationsProps) {
  const { data: recommendations = [], isLoading: loading } = useProductRecommendations(productId)

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((product: any) => {
          const coverImage =
            product.images?.find((img: any) => img.isCoverImage)?.imagePath || product.imagePath
          return (
            <Link key={product.id} href={`/marketplace/${product.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-sm">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {product.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      {product.category || 'Uncategorized'}
                    </span>
                    {product.price && (
                      <span className="text-sm font-semibold">₹{product.price.toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

