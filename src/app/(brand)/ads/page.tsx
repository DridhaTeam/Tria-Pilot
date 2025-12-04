'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AdsPage() {
  const [productImage, setProductImage] = useState<string>('')
  const [influencerImage, setInfluencerImage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    id: string
    imageUrl: string
    copy: string[]
    rating: any
  } | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'influencer') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (type === 'product') {
        setProductImage(base64)
      } else {
        setInfluencerImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage: productImage || undefined,
          influencerImage: influencerImage || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult(data)
      toast.success('Ad generated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Ad Generator</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>Upload product and/or influencer images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product Image (Optional)</Label>
              <Input
                id="product"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'product')}
              />
              {productImage && (
                <img src={productImage} alt="Product" className="w-full h-48 object-cover rounded" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="influencer">Influencer Image (Optional)</Label>
              <Input
                id="influencer"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'influencer')}
              />
              {influencerImage && (
                <img
                  src={influencerImage}
                  alt="Influencer"
                  className="w-full h-48 object-cover rounded"
                />
              )}
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate Ad'}
            </Button>
          </CardContent>
        </Card>
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Ad</CardTitle>
              <CardDescription>Score: {result.rating?.score || 'N/A'}/100</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <img src={result.imageUrl} alt="Generated Ad" className="w-full rounded" />
              {result.copy && result.copy.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Ad Copy:</h3>
                  {result.copy.map((copy, i) => (
                    <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {copy}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

