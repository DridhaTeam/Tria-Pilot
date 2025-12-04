import { createClient } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Instagram, Youtube, Twitter } from 'lucide-react'
import RequestCollaborationButton from '@/components/collaborations/RequestCollaborationButton'

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ influencerId: string }>
}) {
  const { influencerId } = await params
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
  })

  // Only brands can view influencer details
  if (!dbUser || dbUser.role !== 'BRAND') {
    redirect('/')
  }

  const influencer = await prisma.influencerProfile.findUnique({
    where: { userId: influencerId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          slug: true,
        },
      },
    },
  })

  if (!influencer) {
    notFound()
  }

  // Get portfolio
  const portfolio = await prisma.portfolio.findMany({
    where: {
      userId: influencer.userId,
      visibility: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get collaboration history
  const collaborations = await prisma.collaborationRequest.findMany({
    where: {
      influencerId: influencer.userId,
      status: 'accepted',
    },
    include: {
      brand: {
        include: {
          brandProfile: {
            select: {
              companyName: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          brandProfile: true,
        },
      },
    },
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
  })

  const socials = influencer.socials as Record<string, string> || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/brand/marketplace"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-semibold">
                  {influencer.user?.name?.charAt(0) || 'I'}
                </div>
                <div>
                  <CardTitle>{influencer.user?.name || 'Influencer'}</CardTitle>
                  <CardDescription>{influencer.user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              {influencer.bio && (
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{influencer.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Followers</p>
                  <p className="text-lg font-semibold">
                    {influencer.followers
                      ? `${(influencer.followers / 1000).toFixed(1)}k`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Price/Post</p>
                  <p className="text-lg font-semibold">
                    {influencer.pricePerPost
                      ? `₹${influencer.pricePerPost.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                {influencer.engagementRate && (
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Engagement</p>
                    <p className="text-lg font-semibold">
                      {(Number(influencer.engagementRate) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Collabs</p>
                  <p className="text-lg font-semibold">{collaborations.length}</p>
                </div>
              </div>

              {/* Niches */}
              {influencer.niches && Array.isArray(influencer.niches) && (
                <div>
                  <h3 className="font-semibold mb-2">Niches</h3>
                  <div className="flex flex-wrap gap-2">
                    {(influencer.niches as string[]).map((niche: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div>
                <h3 className="font-semibold mb-2">Social Media</h3>
                <div className="space-y-2">
                  {socials.instagram && (
                    <a
                      href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <Instagram className="h-4 w-4" />
                      {socials.instagram}
                    </a>
                  )}
                  {socials.tiktok && (
                    <a
                      href={`https://tiktok.com/@${socials.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <Youtube className="h-4 w-4" />
                      {socials.tiktok}
                    </a>
                  )}
                  {socials.youtube && (
                    <a
                      href={socials.youtube.startsWith('http') ? socials.youtube : `https://youtube.com/${socials.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <Youtube className="h-4 w-4" />
                      {socials.youtube}
                    </a>
                  )}
                  {socials.twitter && (
                    <a
                      href={`https://twitter.com/${socials.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <Twitter className="h-4 w-4" />
                      {socials.twitter}
                    </a>
                  )}
                </div>
              </div>

              <RequestCollaborationButton
                influencerId={influencer.userId}
                brandName={dbUser.name || 'Brand'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Portfolio & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Portfolio */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
            {portfolio.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">No portfolio items yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((item: any) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={item.imagePath}
                      alt={item.title || 'Portfolio item'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Collaborations */}
          {collaborations.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Previous Collaborations</h2>
              <div className="space-y-4">
                {collaborations.map((collab: any) => (
                  <Card key={collab.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {collab.brand.brandProfile?.companyName || collab.brand.name || 'Brand'}
                      </CardTitle>
                      <CardDescription>
                        {new Date(collab.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {collab.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

