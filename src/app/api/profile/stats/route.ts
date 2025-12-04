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

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch stats
    const [generations, collaborations, portfolioItems] = await Promise.all([
      prisma.generationJob.count({ where: { userId: dbUser.id } }),
      prisma.collaborationRequest.count({
        where: {
          OR: [
            { brandId: dbUser.id },
            { influencerId: dbUser.id },
          ],
          status: 'accepted',
        },
      }),
      prisma.portfolio.count({ where: { userId: dbUser.id } }),
    ])

    // Calculate level and XP (gamification)
    const totalXp = generations * 10 + collaborations * 50 + portfolioItems * 5
    const level = Math.floor(totalXp / 100) + 1
    const xp = totalXp % 100
    const nextLevelXp = 100

    // Profile stats can be cached briefly
    return NextResponse.json(
      {
        generations,
        collaborations,
        portfolioItems,
        level,
        xp,
        nextLevelXp,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=120, stale-while-revalidate=300', // 2 min cache, 5 min stale
        },
      }
    )
  } catch (error) {
    console.error('Profile stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

