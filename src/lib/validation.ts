import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['INFLUENCER', 'BRAND']),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const tryOnSchema = z.object({
  personImage: z.string(),
  clothingImage: z.string().optional(),
  model: z.enum(['flash', 'pro']).optional().default('flash'),
  stylePreset: z.string().optional(),
  background: z.string().optional(),
  pose: z.string().optional(),
  expression: z.string().optional(),
  addOns: z.array(z.string()).optional(),
})

export const adGenerationSchema = z.object({
  productImage: z.string().optional(),
  influencerImage: z.string().optional(),
  stylePreferences: z.string().optional(),
  campaignGoals: z.array(z.string()).optional(),
})

export const campaignSchema = z.object({
  title: z.string().min(1),
  goals: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  budget: z.number().optional(),
  timeline: z.string().optional(),
})

export const collaborationSchema = z.object({
  influencerId: z.string(),
  budget: z.number().optional(),
  timeline: z.string().optional(),
  goals: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  link: z.string().url().optional(),
  imagePath: z.string().optional(),
  tags: z.string().optional(),
  audience: z.string().optional(),
  images: z
    .array(
      z.object({
        imagePath: z.string(),
        order: z.number(),
        isTryOnReference: z.boolean(),
        isCoverImage: z.boolean(),
      })
    )
    .optional(),
})

