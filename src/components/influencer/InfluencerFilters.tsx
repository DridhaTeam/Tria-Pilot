'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const niches = ['Fashion', 'Lifestyle', 'Tech', 'Beauty', 'Fitness', 'Travel', 'Food', 'Gaming']
const audiences = ['Men', 'Women', 'Unisex', 'Kids']
const genders = ['Male', 'Female', 'Other']
const categories = ['Casual', 'Formal', 'Streetwear', 'Vintage', 'Sustainable', 'Luxury']
const sortOptions = [
  { value: 'followers', label: 'Followers' },
  { value: 'price', label: 'Price per Post' },
  { value: 'engagement', label: 'Engagement Rate' },
]

export default function InfluencerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/brand/marketplace?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Niche</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={searchParams.get('niche') || ''}
            onChange={(e) => updateFilter('niche', e.target.value)}
          >
            <option value="">All Niches</option>
            {niches.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Audience</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={searchParams.get('audience') || ''}
            onChange={(e) => updateFilter('audience', e.target.value)}
          >
            <option value="">All Audiences</option>
            {audiences.map((audience) => (
              <option key={audience} value={audience}>
                {audience}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Gender</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={searchParams.get('gender') || ''}
            onChange={(e) => updateFilter('gender', e.target.value)}
          >
            <option value="">All</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Preferred Categories</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={searchParams.get('category') || ''}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Sort By</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={searchParams.get('sortBy') || 'followers'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  )
}

