import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
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

    // Get analytics data
    const [products, campaigns, adCreatives, collaborations] = await Promise.all([
      prisma.product.count({
        where: {
          brand: {
            userId: dbUser.id,
          },
        },
      }),
      prisma.campaign.count({
        where: { brandId: dbUser.id },
      }),
      prisma.adCreative.count({
        where: { brandId: dbUser.id },
      }),
      prisma.collaborationRequest.count({
        where: { brandId: dbUser.id },
      }),
    ])

    return NextResponse.json({
      totalProducts: products,
      campaigns: campaigns,
      adCreatives: adCreatives,
      collaborations: collaborations,
    })
  } catch (error) {
    console.error('Brand analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

