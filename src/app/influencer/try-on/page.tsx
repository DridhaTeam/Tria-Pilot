'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { ShoppingBag, Upload, Sparkles, Palette, Download, RefreshCw, ArrowRight, X, Check, PartyPopper } from 'lucide-react'
import { getAllPresets, type TryOnPreset } from '@/lib/prompts/try-on-presets'
import { useProduct } from '@/lib/react-query/hooks'
import { GeneratingOverlay } from '@/components/tryon/GeneratingOverlay'
import { bounceInVariants } from '@/lib/animations'

interface Product {
  id: string
  name: string
  category?: string
  brand?: {
    companyName: string
  }
  tryOnImage?: string
}

function TryOnPageContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')

  const [personImage, setPersonImage] = useState<string>('')
  const [personImageBase64, setPersonImageBase64] = useState<string>('')
  const [clothingImage, setClothingImage] = useState<string>('')
  const [clothingImageBase64, setClothingImageBase64] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<'person' | 'clothing' | null>(null)
  const [result, setResult] = useState<{ jobId: string; imageUrl: string } | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro'>('flash')
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '3:4' | '9:16'>('4:5')
  const [quality, setQuality] = useState<'1K' | '2K' | '4K'>('2K')
  const [dragOver, setDragOver] = useState<'person' | 'clothing' | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const presets = getAllPresets()

  const { data: productData, isLoading: productLoading } = useProduct(productId)

  useEffect(() => {
    if (productData && productData.id) {
      const tryOnImageUrl = productData.images?.find((img: any) => img.isTryOnReference)?.imagePath

      setProduct({
        id: productData.id,
        name: productData.name,
        category: productData.category,
        brand: productData.brand,
        tryOnImage: tryOnImageUrl,
      })

      if (tryOnImageUrl && !clothingImage) {
        setClothingImage(tryOnImageUrl)

        fetch(tryOnImageUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64 = reader.result as string
              setClothingImageBase64(base64)
              toast.success(`Loaded try-on reference for ${productData.name}`)
            }
            reader.readAsDataURL(blob)
          })
          .catch((error) => {
            console.error('Failed to load image:', error)
            toast.error('Failed to load product image')
          })
      }
    }
  }, [productData, productId, clothingImage])

  const handleImageUpload = useCallback((file: File, type: 'person' | 'clothing') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setUploadingImage(type)

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (!base64 || base64.length < 100) {
        toast.error('Invalid image data')
        setUploadingImage(null)
        return
      }

      if (type === 'person') {
        setPersonImage(base64)
        setPersonImageBase64(base64)
        toast.success('Person image uploaded')
      } else {
        setClothingImage(base64)
        setClothingImageBase64(base64)
        toast.success('Clothing image uploaded')
      }
      setUploadingImage(null)
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
      setUploadingImage(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, type: 'person' | 'clothing') => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file, type)
  }, [handleImageUpload])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'clothing') => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file, type)
  }

  const handleGenerate = async () => {
    if (!personImage) {
      toast.error('Please upload a person image')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImage: personImageBase64 || personImage,
          clothingImage: clothingImageBase64 || clothingImage || undefined,
          model: selectedModel,
          stylePreset: selectedPreset || undefined,
          aspectRatio,
          resolution: quality,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult(data)
      setShowCelebration(true)
      toast.success('Try-on generated successfully!')
      // Show celebration for 5 seconds to let success video play fully
      setTimeout(() => setShowCelebration(false), 5000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.imageUrl) return
    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `try-on-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      {/* Gamified Generating Overlay */}
      <GeneratingOverlay isVisible={loading} modelType={selectedModel} />

      {/* Success Celebration Overlay with Mascot Video */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            {/* Backdrop blur */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Confetti particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#E8796D', '#FFD700', '#4CAF50', '#2196F3', '#9C27B0', '#FF69B4'][i % 6],
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  scale: [0, 1.2, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.03,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Mascot Success Video Popup */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: [0, 1.1, 1], rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="relative z-10"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/50 to-emerald-500/50 rounded-3xl blur-2xl scale-110" />

              {/* Video container */}
              <div className="relative w-56 h-56 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                >
                  <source src="/mascot/success.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Success badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg whitespace-nowrap"
              >
                ✨ Ready!
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif text-charcoal mb-2">
              Virtual Try-On <span className="italic">Studio</span>
            </h1>
            <p className="text-charcoal/60">
              Upload your photo and see how products look on you with AI
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 text-charcoal rounded-full hover:bg-charcoal/5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>

        {/* Product Banner */}
        <AnimatePresence>
          {product && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {product.tryOnImage && (
                  <img
                    src={product.tryOnImage}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-green-300"
                  />
                )}
                <div>
                  <p className="text-sm text-green-700 font-medium">Product Selected</p>
                  <p className="text-charcoal font-semibold">{product.name}</p>
                  {product.category && (
                    <p className="text-sm text-charcoal/60">{product.category} • {product.brand?.companyName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setProduct(null)
                  setClothingImage('')
                  setClothingImageBase64('')
                }}
                className="p-2 text-charcoal/40 hover:text-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Upload Areas */}
            <div className="bg-white rounded-2xl border border-subtle p-6">
              <h2 className="text-xl font-semibold text-charcoal mb-6">Upload Images</h2>

              <div className="space-y-4">
                {/* Person Upload */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Your Photo <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver('person') }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, 'person')}
                    className={`relative border-2 border-dashed rounded-xl transition-all ${dragOver === 'person'
                      ? 'border-peach bg-peach/5'
                      : personImage
                        ? 'border-green-300 bg-green-50'
                        : 'border-subtle hover:border-charcoal/30'
                      }`}
                  >
                    {personImage ? (
                      <div className="relative">
                        <img src={personImage} alt="Person" className="w-full h-64 object-cover rounded-xl" />
                        <button
                          onClick={() => { setPersonImage(''); setPersonImageBase64('') }}
                          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4 text-charcoal" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Uploaded
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                        <Upload className="w-10 h-10 text-charcoal/30 mb-3" />
                        <p className="text-sm text-charcoal/60 mb-1">
                          {uploadingImage === 'person' ? 'Uploading...' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-charcoal/40">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileInputChange(e, 'person')}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Clothing Upload */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Clothing Reference {product ? '(Auto-loaded)' : '(Optional)'}
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver('clothing') }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, 'clothing')}
                    className={`relative border-2 border-dashed rounded-xl transition-all ${dragOver === 'clothing'
                      ? 'border-peach bg-peach/5'
                      : clothingImage
                        ? 'border-green-300 bg-green-50'
                        : 'border-subtle hover:border-charcoal/30'
                      }`}
                  >
                    {clothingImage ? (
                      <div className="relative">
                        <img src={clothingImage} alt="Clothing" className="w-full h-48 object-cover rounded-xl" />
                        <button
                          onClick={() => { setClothingImage(''); setClothingImageBase64(''); setProduct(null) }}
                          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4 text-charcoal" />
                        </button>
                        {product && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            From Product
                          </div>
                        )}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                        <Upload className="w-8 h-8 text-charcoal/30 mb-2" />
                        <p className="text-sm text-charcoal/60">
                          {uploadingImage === 'clothing' ? 'Uploading...' : 'Optional: Add clothing reference'}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileInputChange(e, 'clothing')}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Model Selection */}
            <div className="bg-white rounded-2xl border border-subtle p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-charcoal" />
                <h2 className="text-lg font-semibold text-charcoal">AI Model</h2>
              </div>
              <div className="flex gap-3">
                {[
                  { id: 'flash', name: 'Flash', desc: 'Fast (~10s), good quality' },
                  { id: 'pro', name: 'Pro', desc: 'Best quality (~40s), 4K' },
                ].map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id as 'flash' | 'pro')}
                    disabled={loading}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${selectedModel === model.id
                      ? 'border-charcoal bg-charcoal text-cream'
                      : 'border-subtle hover:border-charcoal/30'
                      }`}
                  >
                    <p className="font-medium">{model.name}</p>
                    <p className={`text-xs mt-1 ${selectedModel === model.id ? 'text-cream/70' : 'text-charcoal/60'}`}>
                      {model.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preset */}
            <div className="bg-white rounded-2xl border border-subtle p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-charcoal" />
                <h2 className="text-lg font-semibold text-charcoal">Style Preset</h2>
                <span className="text-xs text-charcoal/50">(Optional)</span>
              </div>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-subtle bg-cream text-charcoal focus:outline-none focus:ring-2 focus:ring-peach/50 transition-all"
              >
                <option value="">None (Default - Clothing Only)</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} - {preset.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-charcoal/50 mt-2">
                {selectedPreset
                  ? presets.find((p) => p.id === selectedPreset)?.description
                  : 'No preset: Only clothing changes, background preserved'}
              </p>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="bg-white rounded-2xl border border-subtle p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                </svg>
                <h2 className="text-lg font-semibold text-charcoal">Aspect Ratio</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', name: 'Square', icon: '□' },
                  { id: '4:5', name: 'Portrait', icon: '▯' },
                  { id: '3:4', name: 'Tall', icon: '▮' },
                  { id: '9:16', name: 'Story', icon: '▯▯' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as '1:1' | '4:5' | '3:4' | '9:16')}
                    disabled={loading}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${aspectRatio === ratio.id
                      ? 'border-charcoal bg-charcoal text-cream'
                      : 'border-subtle hover:border-charcoal/30'
                      }`}
                  >
                    <span className="text-lg">{ratio.icon}</span>
                    <p className={`text-xs mt-1 ${aspectRatio === ratio.id ? 'text-cream/70' : 'text-charcoal/60'}`}>
                      {ratio.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="bg-white rounded-2xl border border-subtle p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-lg font-semibold text-charcoal">Quality</h2>
              </div>
              <div className="flex gap-3">
                {[
                  { id: '1K', name: '1K', desc: 'Fast', disabled: false },
                  { id: '2K', name: '2K', desc: 'Balanced', disabled: false },
                  { id: '4K', name: '4K', desc: 'Best', disabled: selectedModel === 'flash' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => !q.disabled && setQuality(q.id as '1K' | '2K' | '4K')}
                    disabled={loading || q.disabled}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${quality === q.id
                      ? 'border-charcoal bg-charcoal text-cream'
                      : q.disabled
                        ? 'border-subtle/50 text-charcoal/30 cursor-not-allowed'
                        : 'border-subtle hover:border-charcoal/30'
                      }`}
                  >
                    <p className="font-medium">{q.name}</p>
                    <p className={`text-xs mt-0.5 ${quality === q.id ? 'text-cream/70' : q.disabled ? 'text-charcoal/30' : 'text-charcoal/60'}`}>
                      {q.disabled ? 'Pro only' : q.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !personImageBase64}
              whileHover={{ scale: loading || !personImageBase64 ? 1 : 1.02 }}
              whileTap={{ scale: loading || !personImageBase64 ? 1 : 0.98 }}
              className="w-full py-4 bg-charcoal text-cream font-medium rounded-full flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Try-On
                </>
              )}
            </motion.button>

            {!product && (
              <p className="text-center text-sm text-charcoal/50">
                Tip: Select a product from the marketplace to auto-load the clothing reference
              </p>
            )}
          </div>

          {/* Right Column - Result */}
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-subtle overflow-hidden"
                >
                  <div className="p-6 border-b border-subtle">
                    <h2 className="text-xl font-semibold text-charcoal">Generated Result</h2>
                    <p className="text-sm text-charcoal/60">Your virtual try-on is ready!</p>
                  </div>
                  <div className="p-6">
                    <img
                      src={result.imageUrl}
                      alt="Generated Try-On"
                      className="w-full rounded-xl border border-subtle"
                    />
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleDownload}
                        className="flex-1 py-3 bg-charcoal text-cream rounded-full flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setResult(null)
                          setPersonImage('')
                          setPersonImageBase64('')
                          if (!product) {
                            setClothingImage('')
                            setClothingImageBase64('')
                          }
                        }}
                        className="flex-1 py-3 border border-charcoal/20 text-charcoal rounded-full flex items-center justify-center gap-2 hover:bg-charcoal/5 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Another
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-dashed border-subtle p-12 h-full min-h-[500px] flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-charcoal/30" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Generate</h3>
                  <p className="text-charcoal/60 max-w-sm">
                    Upload your photo and select a clothing reference. Your AI-generated try-on will appear here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-charcoal/30" />
        </motion.div>
      </div>
    }>
      <TryOnPageContent />
    </Suspense>
  )
}
