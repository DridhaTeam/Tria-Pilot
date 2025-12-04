'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Influencer {
  id: string
  userId: string
  bio?: string
  niches?: any
  followers?: number
  pricePerPost?: number
  engagementRate?: number
  portfolioPreview?: string[]
  collaborationCount?: number
  user?: {
    id: string
    name?: string
    slug?: string
    email?: string
  }
}

interface InfluencerMarketplaceClientProps {
  influencers: Influencer[]
}

export default function InfluencerMarketplaceClient({
  influencers,
}: InfluencerMarketplaceClientProps) {
  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {influencers.length} {influencers.length === 1 ? 'influencer' : 'influencers'} found
        </p>
      </div>

      {influencers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No influencers found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {influencers.map((influencer) => (
            <Card key={influencer.id} className="h-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-semibold">
                    {influencer.user?.name?.charAt(0) || 'I'}
                  </div>
                  <div className="flex-1">
                    <CardTitle>{influencer.user?.name || 'Influencer'}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {influencer.bio || 'No bio available'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Niches */}
                {influencer.niches && Array.isArray(influencer.niches) && (
                  <div className="flex flex-wrap gap-2">
                    {(influencer.niches as string[]).slice(0, 3).map((niche: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Followers</p>
                    <p className="font-semibold">
                      {influencer.followers
                        ? `${(influencer.followers / 1000).toFixed(1)}k`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Price/Post</p>
                    <p className="font-semibold">
                      {influencer.pricePerPost
                        ? `₹${influencer.pricePerPost.toLocaleString()}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400">Collabs</p>
                    <p className="font-semibold">{influencer.collaborationCount || 0}</p>
                  </div>
                </div>

                {/* Portfolio Preview */}
                {influencer.portfolioPreview && influencer.portfolioPreview.length > 0 && (
                  <div className="flex gap-2">
                    {influencer.portfolioPreview.slice(0, 2).map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href={`/brand/influencers/${influencer.userId}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

