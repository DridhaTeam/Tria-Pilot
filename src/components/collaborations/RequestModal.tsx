'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  influencerId?: string
  productId?: string
  brandName?: string
  productName?: string
  brandId?: string
}

export default function RequestModal({
  isOpen,
  onClose,
  influencerId,
  productId,
  brandName,
  productName,
  brandId,
}: RequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    budget: '',
    timeline: '',
    goals: '',
    notes: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If productId is provided, we need to get the brandId from the product
      let targetInfluencerId = influencerId
      let targetBrandId = brandId

      if (productId && !influencerId) {
        // For product-based collaboration, we need to find the brand
        const productResponse = await fetch(`/api/products?id=${productId}`)
        if (productResponse.ok) {
          const productData = await productResponse.json()
          targetBrandId = productData.brand?.userId
        }
      }

      const response = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(targetInfluencerId && { influencerId: targetInfluencerId }),
          ...(targetBrandId && { brandId: targetBrandId }),
          ...(productId && { productId }),
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          timeline: formData.timeline,
          goals: formData.goals.split(',').map((g) => g.trim()).filter(Boolean),
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send collaboration request')
      }

      toast.success('Collaboration request sent!')
      onClose()
      setFormData({
        budget: '',
        timeline: '',
        goals: '',
        notes: '',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request Collaboration</CardTitle>
              <CardDescription>
                {influencerId
                  ? `Send a collaboration request to this influencer`
                  : `Request collaboration for ${productName}`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {brandName && (
              <div>
                <Label>Brand</Label>
                <Input value={brandName} disabled />
              </div>
            )}
            {productName && (
              <div>
                <Label>Product</Label>
                <Input value={productName} disabled />
              </div>
            )}
            <div>
              <Label htmlFor="budget">Budget (INR)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                placeholder="e.g., 2 weeks, 1 month"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="goals">Goals (comma-separated)</Label>
              <Input
                id="goals"
                placeholder="e.g., brand awareness, sales, engagement"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Message</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tell the influencer about your collaboration proposal..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

