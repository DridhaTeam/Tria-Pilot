import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { adGenerationSchema } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { analyzeClothingImage, rateAdCreative, generateAdCopy } from '@/lib/openai'
import { generateIntelligentAdComposition } from '@/lib/gemini'
import { saveUpload } from '@/lib/storage'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
    })

    if (!dbUser || dbUser.role !== 'BRAND') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    // Check rate limit
    const rateLimit = checkRateLimit(dbUser.id, 'ads')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { productImage, influencerImage, stylePreferences, campaignGoals } =
      adGenerationSchema.parse(body)

    // Analyze images if provided
    let productAnalysis = null
    let influencerAnalysis = null

    if (productImage) {
      productAnalysis = await analyzeClothingImage(productImage)
    }

    if (influencerImage) {
      influencerAnalysis = await analyzeClothingImage(influencerImage)
    }

    // Generate composition prompt
    let compositionPrompt = 'Create a professional ad composition. '
    if (productAnalysis) {
      compositionPrompt += `Product details: ${JSON.stringify(productAnalysis)}. `
    }
    if (influencerAnalysis) {
      compositionPrompt += `Influencer style: ${JSON.stringify(influencerAnalysis)}. `
    }
    if (stylePreferences) {
      compositionPrompt += `Style: ${stylePreferences}. `
    }
    compositionPrompt += 'Focus on professional lighting, balanced composition, and brand consistency.'

    // Generate ad composition
    const generatedImage = await generateIntelligentAdComposition(
      productImage,
      influencerImage,
      compositionPrompt
    )

    // Note: Gemini may return text, not images. In production, use Imagen API for actual image generation
    // For now, we'll assume the result is a base64 image string

    // Rate the ad
    const rating = await rateAdCreative(generatedImage, productImage, influencerImage)

    // Generate ad copy
    const copyVariants = await generateAdCopy(generatedImage, {
      productName: productAnalysis?.garmentType,
      brandName: dbUser.name || undefined,
      niche: stylePreferences,
    })

    // Save image to storage
    const imagePath = `${dbUser.id}/${Date.now()}.jpg`
    const imageUrl = await saveUpload(generatedImage, imagePath, 'ads')

    // Create ad creative record
    const adCreative = await prisma.adCreative.create({
      data: {
        brandId: dbUser.id,
        imagePath: imageUrl,
        copy: copyVariants[0] || '',
        meta: {
          rating: rating as any,
          copyVariants: copyVariants as any,
          productAnalysis: productAnalysis as any,
          influencerAnalysis: influencerAnalysis as any,
        },
      },
    })

    return NextResponse.json({
      id: adCreative.id,
      imageUrl,
      copy: copyVariants,
      rating,
    })
  } catch (error) {
    console.error('Ad generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

