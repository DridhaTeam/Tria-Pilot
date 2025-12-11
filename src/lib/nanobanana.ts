import { GoogleGenAI, type ImageConfig, type GenerateContentConfig, type ContentListUnion } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'

// Initialize the Google GenAI client
const getClient = () => {
  const apiKey = getGeminiKey()
  return new GoogleGenAI({ apiKey })
}

export interface TryOnOptions {
  personImage: string // base64 (with or without data URI prefix) - primary image
  personImages?: string[] // Optional: additional person images for Pro model
  clothingImage?: string // base64 - optional clothing to add/change
  accessoryImages?: string[] // NEW: base64 images of accessories (purse, shoes, hat, etc.)
  accessoryTypes?: ('purse' | 'shoes' | 'hat' | 'jewelry' | 'bag' | 'watch' | 'sunglasses' | 'scarf' | 'other')[] // NEW: type labels for each accessory
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
    personImages = [],
    clothingImage,
    accessoryImages = [], // NEW: accessory images
    accessoryTypes = [], // NEW: accessory type labels
    prompt,
    model = 'gemini-2.5-flash-image',
    aspectRatio = '4:5',
    resolution = '2K',
  } = options

  try {
    console.log('🎨 Starting Gemini image generation...')
    console.log(`Model: ${model}, Aspect Ratio: ${aspectRatio}, Resolution: ${resolution}`)
    console.log(`Prompt preview: ${prompt.substring(0, 150)}...`)

    const client = getClient()

    // Build contents array with prompt and images
    // For Gemini 3 Pro, we can use up to 14 reference images (6 objects + 5 humans) for character consistency
    const contents: ContentListUnion = []

    // 1. Pro-specific vs Flash prompting
    const isPro = model === 'gemini-3-pro-image-preview'

    const enhancedPrompt: string = isPro
      ? `TASK: HIGH-FIDELITY FACE CLONING & CLOTHING COMPOSITING
═══════════════════════════════════════════════════════════════════════════
 OBJECTIVE:
═══════════════════════════════════════════════════════════════════════════
 Clone the exact identity (face, features, skin) from the PERSON IMAGES.
 Composite them wearing the garment from the CLOTHING IMAGE.
 This is NOT a "creative generation" - this is a REPLICATION task.

═══════════════════════════════════════════════════════════════════════════
 1. IDENTITY EXECUTION (CRITICAL):
═══════════════════════════════════════════════════════════════════════════
 START with the Person Image (Image 1).
 PRESERVE EXACT facial topography:
  • Exact Bone Structure (jawline, cheekbones, chin)
  • Exact Feature Shapes (eyes, nose, lips are UNCHANGEABLE constants)
  • Exact Skin Details (moles, pores, scars, texture - DO NOT SMOOTH)
  • Exact Hair (length, color, style - DO NOT GROW HAIR)
  • Exact Body Type (weight, build, proportions - DO NOT SLIM)

 ⛔ FORBIDDEN:
  • NO "Beautification" (do not fix skin, do not slim face)
  • NO "De-aging" (preserve nasolabial folds, age signs)
  • NO "Westernizing" or altering ethnicity
  • NO "Face Swapping" with a generic model - USE THE SOURCE FACE.
  • NO Gender Alteration - if person is female/woman, output MUST be female/woman with correct body proportions. If person is male/man, output MUST be male/man.
  • NO extracting faces from clothing image - COMPLETELY IGNORE any face in clothing reference
  • NO creating multiple people - ONLY ONE PERSON in output (from Person Image)
  • NO using any identity/face/body from clothing image - it is GARMENT ONLY

═══════════════════════════════════════════════════════════════════════════
 2. CLOTHING EXECUTION (CRITICAL - READ CAREFULLY):
═══════════════════════════════════════════════════════════════════════════
 ⚠️⚠️⚠️ CLOTHING IMAGE IS FOR GARMENT EXTRACTION ONLY ⚠️⚠️⚠️
 
 • Extract ONLY the garment/clothing from Clothing Image: color, pattern, texture, buttons, zippers, fabric details
 • COMPLETELY IGNORE ANY FACE in the clothing image - DO NOT extract, copy, or use ANY facial features from it
 • COMPLETELY IGNORE ANY PERSON in the clothing image - DO NOT extract, copy, or use ANY body parts, skin, hair, or identity from it
 • DO NOT create a second person from the clothing image - ONLY ONE PERSON should appear in the output (the person from Person Image)
 • If you see a face in the clothing image, PRETEND IT DOES NOT EXIST - focus ONLY on the garment itself
 
 ⚠️⚠️⚠️ CRITICAL: COMPLETE GARMENT REPLACEMENT (NOT OVERLAY) ⚠️⚠️⚠️
 • REPLACE the ENTIRE garment from the person image - do NOT overlay or blend
 • If clothing reference is SLEEVELESS: REMOVE all sleeves completely, show full arms and shoulders
 • If clothing reference has SLEEVES: Replace with exact sleeve length from reference
 • If clothing reference is TANK TOP/SLEEVELESS: The person's arms, shoulders, and armpits must be FULLY VISIBLE
 • The garment must fit naturally on the person's body - not floating or disconnected
 • Match the exact neckline, armholes, and garment shape from the clothing reference
 • If the person image has sleeves but reference is sleeveless: COMPLETELY REMOVE sleeves, show bare arms
 • If the person image is sleeveless but reference has sleeves: ADD sleeves exactly as shown in reference
 • The garment should look like the person is ACTUALLY WEARING IT, not like it's pasted on

═══════════════════════════════════════════════════════════════════════════
 3. SCENE & STYLE (ATMOSPHERE ONLY - IDENTITY IS ALWAYS PRIORITY):
═══════════════════════════════════════════════════════════════════════════
${prompt}

⚠️⚠️⚠️ CRITICAL: The above style/preset instructions are ONLY for:
- Background scene and environment
- Lighting atmosphere and mood
- Camera settings and framing
- Scene elements and props

⚠️⚠️⚠️ The style/preset CANNOT change:
- Face identity, features, expression (MUST match Person Image exactly)
- Body proportions, shape, gender characteristics (MUST match Person Image exactly)
- Clothing type, color, pattern (MUST match Clothing Image exactly)
- Hair, skin tone, age (MUST match Person Image exactly)

═══════════════════════════════════════════════════════════════════════════
 FINAL OVERRIDE (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════════════════
 IF Style/Preset conflicts with Identity (e.g. style says "smile" but person is serious),
 IDENTITY WINS. IGNORE STYLE. KEEP ORIGINAL FACE.

 IF Style/Preset conflicts with Clothing (e.g. style suggests different clothing),
 CLOTHING WINS. IGNORE STYLE. KEEP ORIGINAL CLOTHING.

 IF Style/Preset conflicts with Body (e.g. style suggests different body shape),
 BODY WINS. IGNORE STYLE. KEEP ORIGINAL BODY.

 PRIORITY ORDER: IDENTITY > CLOTHING > BODY > STYLE/PRESET

 OUTPUT: PHOTOREALISTIC CLONE OF THE PERSON IN THE CLOTHES.`
      : `TASK: EXACT FACE REPLICATION & TRY-ON
═══════════════════════════════════════════════════════════════════════════
 OBJECTIVE: TRANSFER CLOTHING TO THIS EXACT PERSON
═══════════════════════════════════════════════════════════════════════════
 • IMAGE 1 (PERSON): SOURCE OF TRUTH. Copy this face piixel-perfectly.
 • IMAGE 2 (CLOTHING): Source of garment.

═══════════════════════════════════════════════════════════════════════════
 CLOTHING REPLACEMENT (CRITICAL - COMPLETE REPLACEMENT, NOT OVERLAY):
═══════════════════════════════════════════════════════════════════════════
 ⚠️⚠️⚠️ REPLACE THE ENTIRE GARMENT FROM IMAGE 1 WITH THE GARMENT FROM IMAGE 2 ⚠️⚠️⚠️
 
 • Extract the EXACT garment from Image 2 (Clothing): color, pattern, texture, buttons, zippers, fabric details
 • COMPLETELY IGNORE ANY FACE in Image 2 - DO NOT extract, copy, or use ANY facial features
 • COMPLETELY IGNORE ANY PERSON in Image 2 - DO NOT extract, copy, or use ANY body parts, skin, hair, or identity
 
 ⚠️⚠️⚠️ SLEEVELESS CLOTHING HANDLING (CRITICAL) ⚠️⚠️⚠️
 • If Image 2 (Clothing) is SLEEVELESS (tank top, sleeveless top, etc.):
   - COMPLETELY REMOVE all sleeves from Image 1
   - Show FULL arms, shoulders, and armpits
   - The garment armholes must match the reference exactly
   - Arms must be fully visible, not partially covered
 • If Image 2 (Clothing) has SLEEVES:
   - Replace with EXACT sleeve length from Image 2
   - Match sleeve style, fit, and length precisely
 • If Image 1 has sleeves but Image 2 is sleeveless: REMOVE sleeves completely
 • If Image 1 is sleeveless but Image 2 has sleeves: ADD sleeves exactly as shown in Image 2
 
 ⚠️⚠️⚠️ COMPLETE GARMENT REPLACEMENT RULES ⚠️⚠️⚠️
 • REPLACE the ENTIRE garment - do NOT overlay, blend, or mix
 • Match EXACT neckline shape from Image 2
 • Match EXACT armhole shape from Image 2
 • The garment must fit naturally on the person's body
 • The garment should look like the person is ACTUALLY WEARING IT, not pasted on
 • Match all design elements: buttons, zippers, patterns, logos exactly from Image 2

═══════════════════════════════════════════════════════════════════════════
 IDENTITY RULES (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════════════════
 • The face in the output MUST be a digital clone of Image 1.
 • PRESERVE: Face shape, nose width, jawline, cheek fullness.
 • PRESERVE: Gender expression EXACTLY (female/woman stays female/woman, male/man stays male/man) - CRITICAL.
 • PRESERVE: Skin irregularities, moles, signs of age (No beautification).
 • PRESERVE: Body size and proportions (No slimming). For women: preserve curves, hip-to-waist ratio, breast shape. For men: preserve masculine structure, shoulder width.
 • PRESERVE: Hair length and style (Short stays short).

 ⛔ DO NOT BE CREATIVE WITH THE FACE. COPY IT.
 ⛔ DO NOT extract or use ANY face from the clothing image - ONLY use the person from Image 1.
 ⛔ ONLY ONE PERSON in output - the person from Image 1. NO second person from clothing image.

═══════════════════════════════════════════════════════════════════════════
 STYLE INSTRUCTIONS (ATMOSPHERE ONLY - IDENTITY IS ALWAYS PRIORITY):
═══════════════════════════════════════════════════════════════════════════
${prompt}

⚠️⚠️⚠️ CRITICAL: The above style/preset instructions are ONLY for:
- Background scene and environment
- Lighting atmosphere and mood
- Camera settings and framing

⚠️⚠️⚠️ The style/preset CANNOT change:
- Face identity, features, expression (MUST match Image 1 exactly)
- Body proportions, shape, gender characteristics (MUST match Image 1 exactly)
- Clothing type, color, pattern (MUST match Clothing Image exactly)

═══════════════════════════════════════════════════════════════════════════
 PRIORITY FINAL CHECK (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════════════════
If style/preset prompts differ from the face in Image 1, IGNORE style.
If style/preset prompts differ from the body in Image 1, IGNORE style.
If style/preset prompts differ from the clothing, IGNORE style.

PRIORITY ORDER: IDENTITY > CLOTHING > BODY > STYLE/PRESET

IDENTITY IS KING. CLOTHING IS QUEEN. STYLE IS SERVANT.

OUTPUT: The SAME PERSON from Image 1 wearing the new clothes. ONLY ONE PERSON. NO second person from clothing image.`;

    contents.push(enhancedPrompt)

    // 2. Add person image(s) (CRITICAL for identity)
    if (!personImage) {
      throw new Error('Person image is required for try-on generation')
    }

    const cleanPersonImage = personImage.replace(/^data:image\/[a-z]+;base64,/, '')
    if (!cleanPersonImage || cleanPersonImage.length < 100) {
      throw new Error('Invalid person image: image data is too short or empty')
    }

    // CRITICAL: Label person images explicitly as FACE SOURCE
    contents.push(`🎯🎯🎯 FACE SOURCE - USE THIS FACE ONLY 🎯🎯🎯
The following image(s) are the ONLY source for the person's face and identity.
COPY THIS FACE EXACTLY. This is the ONLY face that should appear in the output.
DO NOT use any face from the clothing reference image.`)

    if (isPro) {
      const allPersonImages = [cleanPersonImage]

      for (const additionalImage of personImages.slice(0, 4)) {
        const cleanAdditional = additionalImage.replace(/^data:image\/[a-z]+;base64,/, '')
        if (cleanAdditional && cleanAdditional.length >= 100) {
          allPersonImages.push(cleanAdditional)
        }
      }

      while (allPersonImages.length < 3) {
        allPersonImages.push(cleanPersonImage)
      }

      for (let i = 0; i < Math.min(allPersonImages.length, 5); i++) {
        contents.push(`[FACE SOURCE ${i + 1}] - Copy this exact face:`)
        contents.push({
          inlineData: {
            data: allPersonImages[i],
            mimeType: 'image/jpeg',
          },
        } as any)
      }
      console.log(`📸 Added ${Math.min(allPersonImages.length, 5)} person image(s) for Pro character DNA`)
    } else {
      contents.push('[FACE SOURCE - PRIMARY] - This is THE face to copy:')
      contents.push({
        inlineData: {
          data: cleanPersonImage,
          mimeType: 'image/jpeg',
        },
      } as any)
      contents.push('[FACE SOURCE - REINFORCEMENT] - Same face again for emphasis:')
      contents.push({
        inlineData: {
          data: cleanPersonImage,
          mimeType: 'image/jpeg',
        },
      } as any)
      console.log('📸 Added person image 2x for Flash face reference')
    }

    // 3. Add clothing image if provided (with MAXIMUM guardrails against face extraction)
    if (clothingImage) {
      contents.push(`🚫🚫🚫 CLOTHING REFERENCE - GARMENT ONLY - NO FACE 🚫🚫🚫

⛔⛔⛔ CRITICAL WARNING ⛔⛔⛔
The next image is a CLOTHING REFERENCE ONLY.
There MAY be a person/face in this image - YOU MUST COMPLETELY IGNORE IT.

🎯 YOUR TASK FOR THIS IMAGE:
✅ EXTRACT: The garment/clothing ONLY (color, pattern, texture, buttons, zippers, fabric)
❌ IGNORE: ANY face in this image - DO NOT copy, use, or reference it
❌ IGNORE: ANY person/body in this image - DO NOT copy skin, hair, or body shape
❌ IGNORE: ANY identity in this image - The face you use comes from [FACE SOURCE] images ONLY

⚠️ THE FACE IN THE OUTPUT MUST COME FROM THE [FACE SOURCE] IMAGES ABOVE ⚠️
⚠️ NOT from this clothing reference image ⚠️
⚠️ If you see a face here, PRETEND IT DOES NOT EXIST ⚠️

Think of this image as a FLAT LAY or PRODUCT PHOTO - extract the garment as if it were on a mannequin.`)

      contents.push('[GARMENT REFERENCE - EXTRACT CLOTHING ONLY, IGNORE ANY FACE]:')
      const cleanClothingImage = clothingImage.replace(/^data:image\/[a-z]+;base64,/, '')
      if (cleanClothingImage && cleanClothingImage.length >= 100) {
        contents.push({
          inlineData: {
            data: cleanClothingImage,
            mimeType: 'image/jpeg',
          },
        } as any)

        contents.push(`✅ CLOTHING IMAGE PROCESSED - VERIFICATION CHECKLIST:
□ Did you extract ONLY the garment details? (color, pattern, texture, buttons, zippers)
□ Did you COMPLETELY IGNORE any face in that image? (The face MUST come from [FACE SOURCE])
□ Did you COMPLETELY IGNORE any person/body in that image?
□ Will the output show the face from [FACE SOURCE] images, NOT from this clothing image?

⚠️ REMINDER: The output face = [FACE SOURCE] face. NOT the clothing image face.`)

        console.log('👕 Added clothing image with MAXIMUM face-ignore guardrails')
      } else {
        console.warn('Clothing image appears invalid, skipping')
      }
    }

    // 4. Add accessory references if provided (treated similar to clothing)
    if (accessoryImages.length > 0) {
      const accessoryLabels = accessoryTypes.length > 0 ? accessoryTypes : accessoryImages.map(() => 'accessory')
      contents.push('👜 ACCESSORY REFERENCES (apply EXACT item, ignore any faces/bodies in reference):')

      accessoryImages.slice(0, 4).forEach((image, idx) => {
        const cleanAccessory = image.replace(/^data:image\/[a-z]+;base64,/, '')
        if (cleanAccessory && cleanAccessory.length >= 100) {
          const label = accessoryLabels[idx] || `accessory_${idx + 1}`
          contents.push(`Accessory: ${label}`)
          contents.push({
            inlineData: {
              data: cleanAccessory,
              mimeType: 'image/jpeg',
            },
          } as any)
          console.log(`👜 Added accessory reference: ${label}`)
        }
      })
    }

    // 5. Add person image again at the end for FINAL identity lock
    contents.push(`🎯🎯🎯 FINAL FACE VERIFICATION - THIS IS THE FACE TO USE 🎯🎯🎯
Look at this image one more time. THIS is the face that MUST appear in your output.
NOT any face from the clothing reference. THIS FACE ONLY.`)
    
    contents.push('[FINAL FACE SOURCE - USE THIS EXACT FACE IN OUTPUT]:')
    contents.push({
      inlineData: {
        data: cleanPersonImage,
        mimeType: 'image/jpeg',
      },
    } as any)
    contents.push(`🔒 FINAL IDENTITY LOCK - READ CAREFULLY 🔒

THIS IS A FACE CLONING TASK - NOT A CREATIVE GENERATION TASK.

FACE SOURCE: The [FACE SOURCE] images shown above (and this final image)
FACE TO USE: ONLY the face from [FACE SOURCE] images
FACE TO IGNORE: ANY face that appeared in the [GARMENT REFERENCE] image

VERIFICATION BEFORE OUTPUT:
1. ✅ The FACE in output = exact copy of [FACE SOURCE] face (jawline, eyes, nose, lips, skin tone)
2. ✅ The FACE in output ≠ the face from clothing reference (if there was one)
3. ✅ ONLY ONE PERSON in output - from [FACE SOURCE]
4. ✅ GENDER preserved exactly (female stays female, male stays male)
5. ✅ HAIR matches [FACE SOURCE] (length, color, style)
6. ✅ BODY matches [FACE SOURCE] (proportions, build)
7. ✅ CLOTHING matches [GARMENT REFERENCE] (color, pattern, texture)

⛔ DO NOT use any face from the clothing image
⛔ DO NOT generate a random/generic face
⛔ DO NOT beautify or alter the [FACE SOURCE] face

OUTPUT = [FACE SOURCE] person wearing [GARMENT REFERENCE] clothing.`)
    console.log('🔒 Added FINAL identity anchor with explicit face source reminder')

    console.log('✅ Contents prepared with strict references')

    // Build image config
    const imageConfig = {
      aspectRatio: aspectRatio,
      // Enable person generation for face consistency
      personGeneration: 'allow_adult',
    } as ImageConfig

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
    console.log(`✅ Gemini responded in ${duration} s`)

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
            console.log(`✅ Image extracted from candidates(${part.inlineData.mimeType})`)
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
      throw new Error(`Gemini generation failed: ${error.message} `)
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
