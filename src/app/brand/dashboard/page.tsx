import { createClient } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageViewer } from '@/components/image-viewer'

export default async function BrandDashboard() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: {
      brandProfile: {
        include: {
          products: {
            take: 6,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      campaigns: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      adCreatives: {
        take: 6,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user || user.role !== 'BRAND') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-serif text-charcoal mb-6">Brand Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/brand/products">Manage Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Influencer Marketplace</CardTitle>
            <CardDescription>Discover influencers for collaborations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/brand/marketplace">Browse Influencers</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ad Generator</CardTitle>
            <CardDescription>Create AI-powered ads</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/brand/ads">Generate Ads</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Manage campaigns with AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/brand/campaigns">View Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collaborations</CardTitle>
            <CardDescription>Manage collaboration requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/brand/collaborations">View Collaborations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Ad Creatives</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {user.adCreatives.map((ad: any) => (
            <Card key={ad.id}>
              <CardHeader>
                <CardTitle className="text-sm">Ad {ad.id.slice(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageViewer
                  src={ad.imagePath}
                  alt={`Ad creative ${ad.id.slice(0, 8)}`}
                  className="w-full h-48 object-cover rounded"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

