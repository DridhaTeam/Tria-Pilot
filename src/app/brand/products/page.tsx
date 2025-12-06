'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Camera, Box } from 'lucide-react'
import { useProducts } from '@/lib/react-query/hooks'
import { useQueryClient } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  description?: string
  category?: string
  price?: number
  link?: string
  tags?: string
  audience?: string
  imagePath?: string // Legacy field, deprecated in favor of images array
  images?: Array<{
    id: string
    imagePath: string
    isCoverImage: boolean
    isTryOnReference: boolean
  }>
}

const CATEGORIES = ['Clothing', 'Accessories', 'Footwear', 'Beauty', 'Lifestyle']
const AUDIENCES = ['Men', 'Women', 'Unisex', 'Kids']

export default function BrandProductsPage() {
  const queryClient = useQueryClient()
  const { data: productsData, isLoading: loading } = useProducts({ brandId: 'current' })
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    audience: '',
    price: '',
    link: '',
    tags: '',
  })
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([])
  const [tryOnImageIndex, setTryOnImageIndex] = useState<number | null>(null)
  const [coverImageIndex, setCoverImageIndex] = useState<number | null>(null)

  // Extract products from data (handle both array and paginated response)
  const products: Product[] = Array.isArray(productsData) 
    ? productsData 
    : productsData?.data || []

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      const newImages = [...images]
      newImages[index] = { file, preview }
      setImages(newImages.filter((img: any) => img !== undefined))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    if (tryOnImageIndex === index) setTryOnImageIndex(null)
    if (coverImageIndex === index) setCoverImageIndex(null)
    if (tryOnImageIndex !== null && tryOnImageIndex > index) setTryOnImageIndex(tryOnImageIndex - 1)
    if (coverImageIndex !== null && coverImageIndex > index) setCoverImageIndex(coverImageIndex - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate
      if (!formData.name || !formData.category || !formData.audience) {
        toast.error('Please fill in all required fields')
        setSubmitting(false)
        return
      }

      if (images.length === 0) {
        toast.error('Please upload at least one image')
        setSubmitting(false)
        return
      }

      if (tryOnImageIndex === null) {
        toast.error('Please select an image for Try-On reference')
        setSubmitting(false)
        return
      }

      if (coverImageIndex === null) {
        toast.error('Please select a cover image for marketplace')
        setSubmitting(false)
        return
      }

      // Upload images to Supabase Storage
      const uploadedImages: Array<{
        imagePath: string
        order: number
        isTryOnReference: boolean
        isCoverImage: boolean
      }> = []

      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const formDataUpload = new FormData()
        formDataUpload.append('file', image.file)
        formDataUpload.append('bucket', 'products')

        const uploadResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Upload error details:', errorData)
          throw new Error(errorData.error || `Failed to upload image ${i + 1}`)
        }

        const uploadData = await uploadResponse.json()
        
        if (!uploadData.path) {
          throw new Error(`Upload succeeded but no path returned for image ${i + 1}`)
        }

        uploadedImages.push({
          imagePath: uploadData.path,
          order: i + 1,
          isTryOnReference: i === tryOnImageIndex,
          isCoverImage: i === coverImageIndex,
        })
      }

      // Create product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : undefined,
          images: uploadedImages,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create product')
      }

      toast.success('Product created successfully!')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        audience: '',
        price: '',
        link: '',
        tags: '',
      })
      setImages([])
      setTryOnImageIndex(null)
      setCoverImageIndex(null)
      
      // Invalidate products query to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (error) {
      console.error('Product creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
      toast.error(errorMessage)
      
      // If upload failed, show more specific error
      if (errorMessage.includes('upload')) {
        toast.error('Please check that the "products" bucket exists in Supabase Storage and has proper permissions')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Box className="h-7 w-7 text-zinc-900 dark:text-zinc-100" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Manage Products</h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-base ml-10">
            Add products that influencers can discover instantly in the marketplace
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Add New Product Form */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Box className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <CardTitle className="text-lg font-semibold">Add New Product</CardTitle>
              </div>
              <CardDescription>Upload up to 5 images and fill the details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Product name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sunset Satin Dress"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Audience</Label>
                <select
                  id="audience"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  required
                >
                  <option value="">Select audience</option>
                  {AUDIENCES.map((aud) => (
                    <option key={aud} value={aud}>
                      {aud}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price (INR)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="2500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Product URL</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://yourbrand.com/product"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-md border border-zinc-300 dark:border-zinc-700 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-y"
                  placeholder="Describe fabric, fit, and highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="evening, satin, trending"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Images (up to 5)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="relative">
                      <label
                        className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          images[index] ? 'border-primary' : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {images[index] ? (
                          <div className="relative w-full h-full">
                            <img
                              src={images[index].preview}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <Camera className="h-8 w-8 text-zinc-400 mb-2" />
                            <span className="text-sm text-zinc-400">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(index, e)}
                          disabled={images.length >= 5 && !images[index]}
                        />
                      </label>
                      {images[index] && (
                        <div className="mt-2 space-y-1">
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="radio"
                              name="tryOn"
                              checked={tryOnImageIndex === index}
                              onChange={() => setTryOnImageIndex(index)}
                            />
                            Try-On
                          </label>
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="radio"
                              name="cover"
                              checked={coverImageIndex === index}
                              onChange={() => setCoverImageIndex(index)}
                            />
                            Cover
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  Select which uploaded image becomes the clothing reference for Try-On.
                </p>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Product'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Your Products */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Your Products</CardTitle>
            <CardDescription>All products appear in influencer marketplace.</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⭐</div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  No products yet. Add your first product to appear in the marketplace!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const coverImage = product.images?.find((img: any) => img.isCoverImage)?.imagePath || product.imagePath
                  return (
                    <div key={product.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {coverImage && (
                        <img
                          src={coverImage}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                          loading="lazy"
                        />
                      )}
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{product.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        {product.category || 'Uncategorized'}
                      </p>
                      {product.price && (
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">₹{product.price.toLocaleString()}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

