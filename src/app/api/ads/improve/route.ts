import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { generateAdImprovementSuggestions } from '@/lib/openai'
import { z } from 'zod'

const improveSchema = z.object({
  adImage: z.string(),
  productType: z.string().optional(),
  niche: z.string().optional(),
  audience: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { adImage, productType, niche, audience } = improveSchema.parse(body)

    const suggestions = await generateAdImprovementSuggestions(adImage, {
      productType,
      niche,
      audience,
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Ad improvement error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

