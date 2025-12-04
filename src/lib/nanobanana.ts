import { GoogleGenAI, type ImageConfig, type GenerateContentConfig, type ContentListUnion } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'

// Initialize the Google GenAI client
const getClient = () => {
  const apiKey = getGeminiKey()
  return new GoogleGenAI({ apiKey })
}

export interface TryOnOptions {
  personImage: string // base64 (with or without data URI prefix)
  clothingImage?: string // base64 (with or without data URI prefix)
  prompt: string
  model?: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9'
  resolution?: '1K' | '2K' | '4K' // Pro model only
  background?: string
  pose?: string
  expression?: string
}

/**
 * Generate virtual try-on image using Gemini image generation models
 * 
 * INSTRUCTIONS TO GEMINI:
 * 
 * CRITICAL FOCUS AREAS (MUST PRIORITIZE):
 * 1. REALISM: Generate photorealistic images with authentic details, natural textures, realistic fabric behavior (folds, creases, drape), and realistic physics
 * 2. LIGHTING: Follow lighting instructions exactly - implement the specified source, direction, quality, and color temperature. Create realistic shadows and highlights on clothing and skin
 * 3. TONE: Maintain consistent color palette, mood, and aesthetic throughout the entire image
 * 4. FACE CONSISTENCY: Preserve the person's identity EXACTLY - all facial features (face shape, eyes, nose, mouth, skin tone, hair, expression) must match the reference image perfectly with no changes
 * 5. CLOTHING CONSISTENCY: Match clothing EXACTLY - color, pattern, fabric texture, fit, and all micro-details (zippers, buttons, patterns, textures) must match the reference image precisely
 * 
 * PROCESS:
 * 1. Receive the intelligent prompt from GPT-4o Mini (contains detailed scene, lighting, identity, and clothing instructions)
 * 2. Process both person and clothing reference images
 * 3. Generate photorealistic try-on image following the prompt exactly
 * 4. Preserve person's identity (facial features must match exactly - no changes to face shape, eyes, nose, mouth, skin tone, hair color/texture/style/length, expression, age)
 * 5. Apply clothing accurately (color, pattern, fabric texture, fit type, neckline, sleeve length, design elements must match reference exactly)
 * 6. Maintain realistic physics and natural fabric behavior (realistic folds, creases, drape, shadows, highlights)
 * 7. Implement lighting as specified in prompt (source, direction, quality, color temperature) with realistic shadows and highlights
 * 8. Maintain consistent tone and color palette throughout
 * 9. Use specified aspect ratio and resolution
 * 
 * Model Options:
 * - gemini-2.5-flash-image (Nano Banana): Fast (~10s), 1024px, up to 3 ref images, GOOD face lock
 * - gemini-3-pro-image-preview (Nano Banana Pro): Slow (~40s), up to 4K, up to 14 ref images, EXCELLENT face lock
 * 
 * FACE LOCK STRATEGY:
 * Both models implement CHARACTER LOCK through:
 * 1. Detailed identity preservation instructions in the prompt
 * 2. Reference image passed as inline data (critical for face matching)
 * 3. Explicit "DO NOT CHANGE" directives for facial features
 * 
 * Pro model offers superior face lock due to:
 * - Advanced reasoning ("Thinking" mode)
 * - Support for up to 14 reference images for character consistency
 * - Higher fidelity at capturing subtle facial features
 * 
 * Flash model provides good face lock through:
 * - Fast inference optimized for identity preservation
 * - Supports up to 3 reference images
 * - Cost-effective for high-volume try-ons
 * 
 * @param options - Try-on generation options
 * @param options.personImage - Base64 person image (required)
 * @param options.clothingImage - Base64 clothing image (optional)
 * @param options.prompt - Intelligent prompt from GPT-4o Mini (required)
 * @param options.model - Gemini model to use (default: gemini-3-pro-image-preview)
 * @param options.aspectRatio - Image aspect ratio (default: 4:5 portrait)
 * @param options.resolution - Image resolution for Pro model (default: 2K)
 * @returns Base64 encoded image with data URI prefix
 */
export async function generateTryOn(options: TryOnOptions): Promise<string> {
  const {
    personImage,
    clothingImage,
    prompt,
    model = 'gemini-2.5-flash-image', // Default to Flash (faster, cheaper, good quality)
    aspectRatio = '4:5', // Default portrait aspect ratio for try-on
    resolution = '2K', // Default 2K for quality
  } = options

  try {
    console.log('🎨 Starting Gemini image generation...')
    console.log(`Model: ${model}, Aspect Ratio: ${aspectRatio}, Resolution: ${resolution}`)
    console.log(`Prompt preview: ${prompt.substring(0, 150)}...`)

    const client = getClient()

    // Build contents array with prompt and images
    // For Gemini 3 Pro, we can use up to 14 reference images (6 objects + 5 humans) for character consistency
    const contents: ContentListUnion = []

    // 1. Add STRICT lock instructions before the prompt
    const enhancedPrompt = `🔒 ABSOLUTE IDENTITY LOCK - ZERO TOLERANCE

FACE RULES (NON-NEGOTIABLE):
- Preserve EXACT facial structure (jawline, cheekbones, lips, nose, eyes)
- Preserve EXACT skin tone (no lightening, darkening, or smoothing)
- Preserve EXACT eye shape, spacing, and eyebrows
- DO NOT add or remove hair
- DO NOT change hair color, volume, or length
- DO NOT add makeup or filters
- DO NOT beautify or enhance the face

BODY RULES (NON-NEGOTIABLE):
- Preserve EXACT body proportions (no slimming or bulking)
- Preserve EXACT pose and posture
- Preserve EXACT shoulder width and arm position
- DO NOT add muscles or reshape body
- DO NOT change neck angle or hand visibility

CLOTHING RULES (STRICT):
- Apply clothing with EXACT color, pattern, and texture from reference
- Match buttons, stitching, folds, and micro-details precisely
- Sleeve length MUST match original
- No invented textures or colors
- No accessories added unless explicitly in prompt

BACKGROUND RULES:
- Only change background if explicitly instructed in prompt
- Preserve original lighting direction and perspective
- No hallucination effects or cinematic bloom

⚠️ CRITICAL: This is a CLOTHING SWAP ONLY. The person's identity (face, hair, body) must remain 100% identical to the reference image.

${prompt}`

    contents.push(enhancedPrompt)

    // 2. Add person image (CRITICAL for identity)
    if (!personImage) {
      throw new Error('Person image is required for try-on generation')
    }

    const cleanPersonImage = personImage.replace(/^data:image\/[a-z]+;base64,/, '')
    if (!cleanPersonImage || cleanPersonImage.length < 100) {
      throw new Error('Invalid person image: image data is too short or empty')
    }

    // For Gemini 3 Pro, we can add the person image multiple times for better face lock
    // (up to 5 human references allowed)
    if (model === 'gemini-3-pro-image-preview') {
      // Add person image as primary reference (counts as 1 of 5 human references)
      contents.push({
        inlineData: {
          data: cleanPersonImage,
          mimeType: 'image/jpeg',
        },
      } as any)
      // Note: We could add multiple angles/views here if available for even better consistency
      // For now, we use the single person image as the primary reference
    } else {
      // Flash model: single person image (up to 3 images total)
      contents.push({
        inlineData: {
          data: cleanPersonImage,
          mimeType: 'image/jpeg',
        },
      } as any)
    }

    // 3. Add clothing image if provided (counts as 1 of 6 object references for Pro)
    if (clothingImage) {
      const cleanClothingImage = clothingImage.replace(/^data:image\/[a-z]+;base64,/, '')
      if (cleanClothingImage && cleanClothingImage.length >= 100) {
        contents.push({
          inlineData: {
            data: cleanClothingImage,
            mimeType: 'image/jpeg',
          },
        } as any)
      } else {
        console.warn('Clothing image appears invalid, skipping')
      }
    }

    // Build image config
    const imageConfig: ImageConfig = {
      aspectRatio: aspectRatio as any,
    }

    if (model === 'gemini-3-pro-image-preview' && resolution) {
      imageConfig.imageSize = resolution as any
    }

    // Build generation config
    const config: GenerateContentConfig = {
      responseModalities: ['IMAGE'],
      imageConfig,
    }

    console.log('📡 Sending generation request to Gemini...')
    const startTime = Date.now()

    // Generate content
    const response = await client.models.generateContent({
      model,
      contents,
      config,
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Gemini responded in ${duration}s`)

    // Extract image from response
    if (response.data) {
      console.log('✅ Image extracted from response.data')
      return `data:image/png;base64,${response.data}`
    }

    // Check candidates for inline data
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0]
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            console.log(`✅ Image extracted from candidates (${part.inlineData.mimeType})`)
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          }
        }
      }
    }

    console.error('❌ No image found in Gemini response')
    console.error('Response structure:', JSON.stringify(response, null, 2).substring(0, 500))
    throw new Error('No image generated by Gemini - response structure unexpected')
  } catch (error) {
    console.error('❌ Gemini image generation error:', error)

    if (error instanceof Error) {
      // Provide user-friendly error messages
      if (error.message.includes('API key')) {
        throw new Error('Gemini API key is invalid or missing. Please check your GEMINI_API_KEY environment variable.')
      } else if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later or upgrade your plan.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Gemini API request timed out. The service may be experiencing high load. Please try again.')
      } else if (error.message.includes('Invalid person image')) {
        throw error // Re-throw validation errors as-is
      }
      // Re-throw with original message
      throw new Error(`Gemini generation failed: ${error.message}`)
    }

    throw new Error('Failed to generate image with Gemini')
  }
}

/**
 * Generate try-on with multi-turn conversation support (for iterative refinement)
 * This creates a chat session that can be used for follow-up edits
 */
export async function generateTryOnWithChat(
  options: TryOnOptions,
  chatHistory?: Array<{ role: 'user' | 'model'; content: any }>
): Promise<{ image: string; chat: any }> {
  const {
    personImage,
    clothingImage,
    prompt,
    model = 'gemini-3-pro-image-preview',
    aspectRatio = '4:5',
    resolution = '2K',
  } = options

  try {
    const client = getClient()

    // Build contents
    const contents: ContentListUnion = [prompt]

    if (personImage) {
      const cleanPersonImage = personImage.replace(/^data:image\/[a-z]+;base64,/, '')
      contents.push({
        inlineData: {
          data: cleanPersonImage,
          mimeType: 'image/jpeg',
        },
      } as any)
    }

    if (clothingImage) {
      const cleanClothingImage = clothingImage.replace(/^data:image\/[a-z]+;base64,/, '')
      contents.push({
        inlineData: {
          data: cleanClothingImage,
          mimeType: 'image/jpeg',
        },
      } as any)
    }

    const imageConfig: ImageConfig = {
      aspectRatio: aspectRatio as any,
    }

    if (model === 'gemini-3-pro-image-preview' && resolution) {
      imageConfig.imageSize = resolution as any
    }

    // Create chat for multi-turn conversation
    const chat = await client.chats.create({
      model,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig,
      },
    })

    // Send initial message - contents should be PartListUnion (array of Parts)
    const response = await chat.sendMessage({ message: contents as any })

    // Extract image from response
    let generatedImage: string | null = null

    if (response.data) {
      generatedImage = `data:image/png;base64,${response.data}`
    } else if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0]
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            break
          }
        }
      }
    }

    if (!generatedImage) {
      throw new Error('No image found in response')
    }

    return { image: generatedImage, chat }
  } catch (error) {
    console.error('Gemini chat generation error:', error)
    throw error instanceof Error ? error : new Error('Failed to generate image with chat')
  }
}
