import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiKey } from '@/lib/config/api-keys'

const getGenAI = () => {
  const apiKey = getGeminiKey()
  return new GoogleGenerativeAI(apiKey)
}

export async function generateWithGemini(
  personImage: string,
  clothingImage: string,
  prompt: string
): Promise<string> {
  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          data: personImage,
          mimeType: 'image/jpeg',
        },
      },
      {
        inlineData: {
          data: clothingImage,
          mimeType: 'image/jpeg',
        },
      },
      prompt,
    ])

    const response = await result.response
    // Note: Gemini may return text, not images directly
    // For image generation, you might need a different approach
    return response.text()
  } catch (error) {
    console.error('Gemini generation error:', error)
    throw error
  }
}

export async function generateIntelligentAdComposition(
  productImage?: string,
  influencerImage?: string,
  compositionPrompt?: string
): Promise<string> {
  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const parts: any[] = []

    if (productImage) {
      parts.push({
        inlineData: {
          data: productImage,
          mimeType: 'image/jpeg',
        },
      })
    }

    if (influencerImage) {
      parts.push({
        inlineData: {
          data: influencerImage,
          mimeType: 'image/jpeg',
        },
      })
    }

    parts.push(
      compositionPrompt ||
        'Generate an intelligent ad composition that integrates the product naturally with the influencer. Focus on professional lighting, balanced composition, and brand consistency.'
    )

    const result = await model.generateContent(parts)
    const response = await result.response

    // Note: This returns text. For actual image generation, you may need Imagen API
    return response.text()
  } catch (error) {
    console.error('Gemini ad composition error:', error)
    throw error
  }
}

