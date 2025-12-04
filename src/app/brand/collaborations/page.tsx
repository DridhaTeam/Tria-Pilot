'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

interface Collaboration {
  id: string
  message: string
  status: string
  createdAt: string
  influencer: {
    name?: string
    influencerProfile?: {
      bio?: string
    }
  }
  brand: {
    name?: string
    brandProfile?: {
      companyName?: string
    }
  }
}

export default function BrandCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollaborations()
  }, [])

  const fetchCollaborations = async () => {
    try {
      const response = await fetch('/api/collaborations?type=sent')
      if (!response.ok) {
        throw new Error('Failed to fetch collaborations')
      }
      const data = await response.json()
      setCollaborations(data)
    } catch (error) {
      toast.error('Failed to fetch collaborations')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Collaborations</h1>
        <Button asChild>
          <Link href="/brand/marketplace">Discover Influencers</Link>
        </Button>
      </div>

      {collaborations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No collaboration requests yet. Start by discovering influencers in the marketplace!
          </p>
          <Button asChild>
            <Link href="/brand/marketplace">Browse Influencers</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collaborations.map((collab: any) => (
            <Card key={collab.id}>
              <CardHeader>
                <CardTitle>
                  {collab.influencer.name || collab.influencer.influencerProfile?.bio || 'Influencer'}
                </CardTitle>
                <CardDescription>Status: {collab.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 line-clamp-3">{collab.message}</p>
                <p className="text-xs text-zinc-500">
                  Sent: {new Date(collab.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

