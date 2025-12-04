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
      include: {
        influencerProfile: true,
      },
    })

    if (!dbUser || dbUser.role !== 'INFLUENCER') {
      return NextResponse.json(
        { error: 'Unauthorized - Influencer access required' },
        { status: 403 }
      )
    }

    // Get analytics data
    const [generationJobs, portfolio, collaborations, affiliateEvents, payouts] =
      await Promise.all([
        prisma.generationJob.count({
          where: { userId: dbUser.id },
        }),
        prisma.portfolio.count({
          where: { userId: dbUser.id },
        }),
        prisma.collaborationRequest.count({
          where: { influencerId: dbUser.id },
        }),
        prisma.affiliateEvent.count({
          where: { influencerId: dbUser.influencerProfile?.id },
        }),
        prisma.payout.aggregate({
          where: { influencerId: dbUser.influencerProfile?.id },
          _sum: {
            amount: true,
          },
        }),
      ])

    return NextResponse.json({
      totalGenerations: generationJobs,
      portfolioItems: portfolio,
      collaborations: collaborations,
      affiliateEvents: affiliateEvents,
      totalEarnings: payouts._sum.amount || 0,
    })
  } catch (error) {
    console.error('Influencer analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

