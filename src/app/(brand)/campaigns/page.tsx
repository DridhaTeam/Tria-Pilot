'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import CampaignChatbot from '@/components/campaigns/CampaignChatbot'

interface Campaign {
  id: string
  title: string
  brief: string
  status: string
  createdAt: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    goals: '',
    targetAudience: '',
    budget: '',
    timeline: '',
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      toast.error('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goals: formData.goals.split(',').map((g) => g.trim()),
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      toast.success('Campaign created successfully!')
      setShowForm(false)
      setFormData({
        title: '',
        goals: '',
        targetAudience: '',
        budget: '',
        timeline: '',
      })
      fetchCampaigns()
    } catch (error) {
      toast.error('Failed to create campaign')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Campaign'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Campaign List */}
        <div className="lg:col-span-2">

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">Goals (comma-separated)</Label>
                <Input
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                />
              </div>
              <Button type="submit">Create Campaign</Button>
            </form>
          </CardContent>
        </Card>
      )}

          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <CardTitle>{campaign.title}</CardTitle>
                  <CardDescription>Status: {campaign.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{campaign.brief}</p>
                  <p className="text-xs text-zinc-500">
                    Created: {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Chatbot */}
        <div className="lg:col-span-1">
          <CampaignChatbot />
        </div>
      </div>
    </div>
  )
}

