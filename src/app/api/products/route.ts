import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { productSchema } from '@/lib/validation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

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
      include: {
        brandProfile: true,
      },
    })

    if (!dbUser || dbUser.role !== 'BRAND' || !dbUser.brandProfile) {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, price, link, tags, audience, images } = body

    // Validate required fields
    if (!name || !category || !audience) {
      return NextResponse.json({ error: 'Name, category, and audience are required' }, { status: 400 })
    }

    // Validate images if provided
    if (images && Array.isArray(images)) {
      const tryOnCount = images.filter((img: any) => img.isTryOnReference).length
      const coverCount = images.filter((img: any) => img.isCoverImage).length

      if (tryOnCount !== 1) {
        return NextResponse.json(
          { error: 'Exactly one image must be marked as Try-On reference' },
          { status: 400 }
        )
      }

      if (coverCount !== 1) {
        return NextResponse.json(
          { error: 'Exactly one image must be marked as cover image' },
          { status: 400 }
        )
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        brandId: dbUser.brandProfile.id,
        name,
        description,
        category,
        price: price ? parseFloat(price.toString()) : undefined,
        link,
        tags,
        audience,
        imagePath: images?.[0]?.imagePath || '', // Keep for backward compatibility
        images: images
          ? {
              create: images.map((img: any) => ({
                imagePath: img.imagePath,
                order: img.order,
                isTryOnReference: img.isTryOnReference,
                isCoverImage: img.isCoverImage,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    // If fetching a single product by ID
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          link: true,
          tags: true,
          audience: true,
          imagePath: true,
          createdAt: true,
          updatedAt: true,
          brand: {
            select: {
              id: true,
              companyName: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              imagePath: true,
              order: true,
              isTryOnReference: true,
              isCoverImage: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      // Single product can be cached longer
      return NextResponse.json(product, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
        },
      })
    }

    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const brandId = searchParams.get('brandId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 per page
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = category
    }
    if (brandId === 'current' && authUser) {
      // Get current user's brand products
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email! },
        select: { brandProfile: { select: { id: true } } },
      })
      if (dbUser?.brandProfile) {
        where.brandId = dbUser.brandProfile.id
      }
    } else if (brandId && brandId !== 'current') {
      where.brandId = brandId
    }

    // Fetch products with pagination and optimized select
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          link: true,
          tags: true,
          audience: true,
          imagePath: true,
          createdAt: true,
          updatedAt: true,
          brand: {
            select: {
              id: true,
              companyName: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              imagePath: true,
              order: true,
              isTryOnReference: true,
              isCoverImage: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ])

    // Add caching headers - product listings can be cached
    return NextResponse.json(
      {
        data: products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', // 1 min cache, 5 min stale
        },
      }
    )
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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
        brandProfile: true,
      },
    })

    if (!dbUser || dbUser.role !== 'BRAND') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = z
      .object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.number().optional(),
        link: z.string().url().optional(),
        imagePath: z.string().optional(),
      })
      .parse(body)

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
      },
    })

    if (!product || product.brand.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
      },
    })

    if (!product || product.brand.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

