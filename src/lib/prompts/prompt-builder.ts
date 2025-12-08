/**
 * Primary Prompt Builder
 * Builds prompts following the exact template format specified
 */

import type { GeminiAnalysis } from '@/lib/analysis/gemini-analyzer'
import type { TryOnPreset } from './try-on-presets'

/**
 * Banned verbs that must never appear in presets
 */
export const BANNED_VERBS = [
  'add',
  'change',
  'alter',
  'modify',
  'transform',
  'adjust',
  'replace',
  'remove',
  'reposition',
  'rotate',
  'tilt',
] as const

/**
 * Build the primary prompt following the exact template format
 */
export function buildPrompt(
  analysis: GeminiAnalysis,
  preset: TryOnPreset | null,
  clothingDescription?: string
): string {
  // Base instruction
  const baseInstruction = `You are generating a virtual clothing try-on image.

Rules:
- Keep the person's identity, face, posture, expression and anatomy exactly as they appear in the input photo.
- Interpret the style preset only as guidance for atmosphere, lighting mood, background interpretation and camera feel.
- Do not reinterpret or redesign the person.`

  // Scene Style (from preset positive modifiers)
  const sceneStyle = preset?.positive && preset.positive.length > 0
    ? preset.positive.join('\n')
    : 'Natural, realistic atmosphere with authentic lighting and composition.'

  // Avoid (from preset negative modifiers)
  const avoid = preset?.negative && preset.negative.length > 0
    ? preset.negative.join('\n')
    : 'No reinterpretation of facial structure, pose, or anatomy.'

  // Build preset-specific sections if preset exists
  let presetSections = ''
  if (preset) {
    presetSections = `\n\nPRESET: ${preset.name}\n`

    // Background
    if (preset.background) {
      presetSections += `Background: ${preset.background}\n`
    }

    // Lighting
    if (preset.lighting) {
      presetSections += `Lighting: ${preset.lighting.type} from ${preset.lighting.source}, ${preset.lighting.direction} direction, ${preset.lighting.quality} quality, ${preset.lighting.colorTemp} color temperature\n`
    }

    // Camera
    if (preset.camera_style) {
      presetSections += `Camera: ${preset.camera_style.angle} angle, ${preset.camera_style.lens} lens, ${preset.camera_style.framing} framing`
      if (preset.camera_style.depthOfField) {
        presetSections += `, ${preset.camera_style.depthOfField} depth of field`
      }
      presetSections += `\n`
    }

    // Deviation notes
    if (preset.deviation !== undefined) {
      const deviationNote = preset.deviation <= 0.1
        ? 'STRICT: Apply preset style conservatively, minimal changes to scene.'
        : preset.deviation <= 0.15
          ? 'MODERATE: Apply preset style with balanced artistic freedom.'
          : 'FLEXIBLE: Apply preset style with more creative interpretation, but still preserve identity.'
      presetSections += `Deviation: ${preset.deviation} - ${deviationNote}\n`
    }
  }

  // Clothing description
  const clothingDesc = clothingDescription || buildClothingDescription(analysis)

  // Safety stability lines
  const safetyLines = `CRITICAL SAFETY RULES:
- Preserve exact facial structure, skin tone, hair, and body proportions
- Maintain original pose and expression
- Apply clothing with accurate fit, texture, and color
- Only scene atmosphere, lighting, and camera feel may be influenced by preset
- No physical alterations to the person`

  // Assemble final prompt
  const prompt = `${baseInstruction}

Scene Style:

${sceneStyle}

Avoid:

${avoid}${presetSections}

Clothing:

${clothingDesc}

${safetyLines}

Output:

A realistic try-on photograph of the same person, wearing the clothing, harmonized with the style mood described above.`

  return prompt
}

const FORBIDDEN_PHRASES = [
  'change pose',
  'alter face',
  'modify body',
  'adjust expression',
  'reconstruct',
  'reshape',
  'transform',
]

const SAFE_REPLACEMENTS: Record<string, string> = {
  'change pose': 'same pose',
  'alter face': 'same face',
  'modify body': 'preserve identity',
  'adjust expression': 'keep expression unchanged',
  'reconstruct': 'preserve identity',
  'reshape': 'preserve identity',
  'transform': 'apply cinematic ambience',
}

function sanitizeTextList(list: string[]): { sanitized: string[]; unsafeFound: boolean; warnings: string[] } {
  const warnings: string[] = []
  let unsafeFound = false
  const sanitized = list
    .map((item) => {
      let s = item
      FORBIDDEN_PHRASES.forEach((p) => {
        if (s.toLowerCase().includes(p)) {
          unsafeFound = true
          warnings.push(`Forbidden phrase detected: ${p}`)
          const replacement = SAFE_REPLACEMENTS[p] ?? 'preserve identity'
          s = s.replace(new RegExp(p, 'gi'), replacement)
        }
      })
      return s
    })
    .filter((s) => {
      const lower = s.toLowerCase()
      return !FORBIDDEN_PHRASES.some((p) => lower.includes(p))
    })
  return { sanitized, unsafeFound, warnings }
}

function clampDeviation(d?: number): number {
  const v = typeof d === 'number' ? d : 0.1
  if (v < 0.1) return 0.1
  if (v > 0.5) return 0.5
  return v
}

function sanitizePreset(preset: TryOnPreset | null): {
  presetUsed: TryOnPreset | null
  positive: string[]
  negative: string[]
  deviation: number
  warnings: string[]
  blocked: boolean
} {
  if (!preset) {
    return {
      presetUsed: null,
      positive: [
        'Natural lighting with realistic shadows',
        'Keep the original background from the input photo',
        'Candid photography aesthetic, not stock photo',
        'Subtle natural imperfections (not overly perfect)',
        'Authentic camera feel with natural depth',
        'Subtle natural film grain',
        'Realistic fabric texture fidelity',
        'Match lighting between person and environment',
      ],
      negative: [
        'No identity changes',
        'No pose changes',
        'No facial alterations',
        'No body modifications',
        'No plastic skin or oversmoothing',
        'No HDR over-processing',
        'No CGI-like smooth backgrounds',
        'No unnaturally perfect environments',
      ],
      deviation: 0.1,
      warnings: [],
      blocked: false,
    }
  }
  const posRes = sanitizeTextList(preset.positive || [])
  const negRes = sanitizeTextList(preset.negative || [])
  const blocked = posRes.unsafeFound || negRes.unsafeFound ? true : false
  const deviation = clampDeviation(preset.deviation)
  const warnings = [...posRes.warnings, ...negRes.warnings]
  if (blocked) {
    return {
      presetUsed: null,
      positive: ['Natural lighting', 'Neutral background tone', 'Clean, realistic atmosphere', 'Balanced color harmony', 'Authentic camera feel'],
      negative: ['No identity changes', 'No pose changes', 'No facial alterations', 'No body modifications'],
      deviation,
      warnings,
      blocked,
    }
  }
  return {
    presetUsed: preset,
    positive: Array.from(
      new Set([
        ...posRes.sanitized,
        'Subtle natural film grain',
        'Realistic fabric texture fidelity',
        'Candid photography aesthetic with natural imperfections',
        'Real-world background with authentic textures and depth',
        'Natural lighting with realistic shadows and highlights',
      ])
    ),
    negative: Array.from(
      new Set([
        ...negRes.sanitized,
        'No plastic skin or oversmoothing',
        'No HDR over-processing',
        'No CGI-like smooth backgrounds',
        'No unnaturally perfect or stock photo environments',
        'No overly symmetrical or artificial compositions',
      ])
    ),
    deviation,
    warnings,
    blocked,
  }
}

export function buildTryOnPrompt(
  personImageBase64: string,
  clothingImageBase64: string,
  preset: TryOnPreset | null
): string {
  const { presetUsed, positive, negative, deviation, warnings, blocked } = sanitizePreset(preset)
  console.log('Try-On Preset Applied:', presetUsed ? presetUsed.id : 'neutral')
  console.log('Preset Fields Injected:', {
    positive,
    negative,
    deviation,
    background: presetUsed?.background,
    lighting: presetUsed?.lighting,
    camera: presetUsed?.camera_style,
    safe: presetUsed ? true : true,
  })
  if (warnings.length > 0) {
    console.warn('Preset Warnings:', warnings)
  }
  if (blocked) {
    console.warn('Preset contained unsafe keywords and was blocked')
  }

  const styleBlock = positive.length > 0 ? positive.join('\n') : ''
  const avoidBlock = negative.length > 0 ? negative.join('\n') : ''

  // Build preset-specific sections for background, lighting, camera
  let presetDetails = ''
  if (presetUsed) {
    presetDetails += `\n### Preset: ${presetUsed.name}\n`
    presetDetails += `${presetUsed.description}\n\n`

    if (presetUsed.background) {
      presetDetails += `### Background/Scene\n${presetUsed.background}\n\n`
    }

    // Add background elements (people, objects, atmosphere) for realism
    if (presetUsed.backgroundElements) {
      presetDetails += `### Scene Elements for Realism (IMPORTANT)\n`
      if (presetUsed.backgroundElements.people) {
        presetDetails += `- People in Background: ${presetUsed.backgroundElements.people}\n`
      }
      if (presetUsed.backgroundElements.objects) {
        presetDetails += `- Objects/Props: ${presetUsed.backgroundElements.objects}\n`
      }
      if (presetUsed.backgroundElements.atmosphere) {
        presetDetails += `- Scene Atmosphere: ${presetUsed.backgroundElements.atmosphere}\n`
      }
      presetDetails += '\n'
    }

    if (presetUsed.lighting) {
      presetDetails += `### Lighting\n`
      presetDetails += `- Type: ${presetUsed.lighting.type}\n`
      presetDetails += `- Source: ${presetUsed.lighting.source}\n`
      presetDetails += `- Direction: ${presetUsed.lighting.direction}\n`
      presetDetails += `- Quality: ${presetUsed.lighting.quality}\n`
      presetDetails += `- Color Temperature: ${presetUsed.lighting.colorTemp}\n\n`
    }

    if (presetUsed.camera_style) {
      presetDetails += `### Camera\n`
      presetDetails += `- Angle: ${presetUsed.camera_style.angle}\n`
      presetDetails += `- Lens: ${presetUsed.camera_style.lens}\n`
      presetDetails += `- Framing: ${presetUsed.camera_style.framing}\n`
      if (presetUsed.camera_style.depthOfField) {
        presetDetails += `- Depth of Field: ${presetUsed.camera_style.depthOfField}\n`
      }
      presetDetails += '\n'
    }

    // Add pose guidance if preset defines it
    if (presetUsed.pose) {
      presetDetails += `### Pose & Expression Guidance\n`
      presetDetails += `- Stance: ${presetUsed.pose.stance}\n`
      presetDetails += `- Arms: ${presetUsed.pose.arms}\n`
      presetDetails += `- Expression: ${presetUsed.pose.expression}\n`
      presetDetails += `- Energy: ${presetUsed.pose.energy}\n`
      if (presetUsed.pose.bodyAngle) {
        presetDetails += `- Body Angle: ${presetUsed.pose.bodyAngle}\n`
      }
      presetDetails += '\n'
    }
  }

  let prompt = ''

  // PUT SCENE/BACKGROUND FIRST for maximum impact
  if (presetUsed) {
    prompt += `🎬 SCENE/BACKGROUND (APPLY THIS SCENE - THIS IS THE MAIN VISUAL CHANGE)\n`
    prompt += `=================================================================\n`
    prompt += `**PRESET: ${presetUsed.name}**\n`
    prompt += `${presetUsed.description}\n\n`

    if (presetUsed.background) {
      prompt += `📍 LOCATION/BACKGROUND: ${presetUsed.background}\n`
    }

    if (presetUsed.backgroundElements) {
      if (presetUsed.backgroundElements.people) {
        prompt += `👥 PEOPLE IN SCENE: ${presetUsed.backgroundElements.people}\n`
      }
      if (presetUsed.backgroundElements.objects) {
        prompt += `🎯 OBJECTS/PROPS: ${presetUsed.backgroundElements.objects}\n`
      }
      if (presetUsed.backgroundElements.atmosphere) {
        prompt += `🌟 ATMOSPHERE: ${presetUsed.backgroundElements.atmosphere}\n`
      }
    }

    if (presetUsed.lighting) {
      prompt += `💡 LIGHTING: ${presetUsed.lighting.type} from ${presetUsed.lighting.source}, ${presetUsed.lighting.quality}, ${presetUsed.lighting.colorTemp}\n`
    }

    if (presetUsed.camera_style) {
      prompt += `📷 CAMERA: ${presetUsed.camera_style.angle}, ${presetUsed.camera_style.lens}, ${presetUsed.camera_style.framing}\n`
    }

    if (presetUsed.pose) {
      prompt += `🧍 POSE: ${presetUsed.pose.stance}. Arms: ${presetUsed.pose.arms}. Expression: ${presetUsed.pose.expression}\n`
    }

    prompt += `\n⚠️ THIS SCENE/BACKGROUND IS MANDATORY - The output MUST show this environment.\n`
    prompt += `=================================================================\n\n`
  }

  prompt += '### ⛔ IDENTITY LOCK (MANDATORY - COPY FACE EXACTLY)\n'
  prompt += '• COPY the EXACT face from the reference - DO NOT generate a different face\n'
  prompt += '• COPY the EXACT jawline, face width, face length - NO changes allowed\n'
  prompt += '• COPY the EXACT eyes, nose, lips, skin tone - NO changes allowed\n'
  prompt += '• COPY the EXACT beard/facial hair - DO NOT modify\n'
  prompt += '• COPY the EXACT glasses if present - DO NOT remove\n'
  prompt += '• THIS IS THE SAME PERSON - IDENTITY PRESERVED\n\n'

  prompt += '### Clothing Rules\n'
  prompt += '- Apply the clothing from the reference garment image onto the person.\n'
  prompt += '- Match exact color, pattern, and texture from clothing reference.\n\n'

  if (presetUsed) {
    prompt += '### Apply These Style Modifiers:\n'
    prompt += styleBlock + '\n\n'
  }

  prompt += '### Avoid\n'
  prompt += avoidBlock + '\n\n'

  prompt += '### Output\n'
  prompt += 'Generate: SAME PERSON (face copied from reference) + CLOTHING + SCENE.'

  const sanitizedPrompt = FORBIDDEN_PHRASES.reduce((acc, p) => {
    const replacement = SAFE_REPLACEMENTS[p] ?? 'preserve identity'
    return acc.replace(new RegExp(p, 'gi'), replacement)
  }, prompt)

  console.log('Final Computed Prompt (sanitized):', sanitizedPrompt)
  return sanitizedPrompt
}

/**
 * Build clothing description from analysis
 */
function buildClothingDescription(analysis: GeminiAnalysis): string {
  const parts: string[] = []

  parts.push(`Render the subject wearing the referenced clothing with realistic fabric texture, clean folds, natural drape and accurate fit.`)

  if (analysis.clothing.upper_wear_type) {
    parts.push(`Garment type: ${analysis.clothing.upper_wear_type}.`)
  }

  if (analysis.clothing.upper_wear_color) {
    parts.push(`Color: ${analysis.clothing.upper_wear_color}.`)
  }

  if (analysis.clothing.upper_wear_pattern && analysis.clothing.upper_wear_pattern !== 'none') {
    parts.push(`Pattern: ${analysis.clothing.upper_wear_pattern}.`)
  }

  if (analysis.clothing.upper_wear_texture) {
    parts.push(`Texture: ${analysis.clothing.upper_wear_texture}.`)
  }

  if (analysis.clothing.lower_wear_type) {
    parts.push(`Lower garment: ${analysis.clothing.lower_wear_type}.`)
  }

  if (analysis.clothing.footwear) {
    parts.push(`Footwear: ${analysis.clothing.footwear}.`)
  }

  parts.push(`Maintain the structure of the input photo while expressing the outfit in the defined atmosphere.`)

  return parts.join(' ')
}

/**
 * Merge preset into prompt safely
 */
export function mergePresets(
  basePrompt: string,
  preset: TryOnPreset | null
): string {
  if (!preset) {
    return basePrompt
  }

  // Preset should already be merged in buildPrompt
  // This function is for additional merging if needed
  return basePrompt
}

/**
 * Apply safety rules to prompt
 */
export function applySafetyRules(prompt: string): string {
  let safePrompt = prompt

  // Remove any banned verbs when referring to person/anatomy
  const bannedPatterns = BANNED_VERBS.map(
    (verb) => new RegExp(`\\b${verb}\\s+(face|body|anatomy|pose|expression|skin|hair|person|subject|identity)`, 'gi')
  )

  bannedPatterns.forEach((pattern) => {
    safePrompt = safePrompt.replace(pattern, (match) => {
      console.warn(`⚠️ Removed dangerous verb pattern: ${match}`)
      return 'preserve'
    })
  })

  // Ensure preservation language is present
  if (!safePrompt.includes('preserve') && !safePrompt.includes('keep') && !safePrompt.includes('maintain')) {
    safePrompt = `PRESERVE IDENTITY EXACTLY - ${safePrompt}`
  }

  return safePrompt
}

/**
 * Validate preset for banned verbs
 */
export function validatePreset(preset: TryOnPreset): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check positive modifiers
  if (preset.positive) {
    preset.positive.forEach((modifier, index) => {
      BANNED_VERBS.forEach((verb) => {
        const regex = new RegExp(`\\b${verb}\\b`, 'i')
        if (regex.test(modifier)) {
          errors.push(`Positive modifier ${index + 1} contains banned verb "${verb}": "${modifier}"`)
        }
      })
    })
  }

  // Check negative modifiers
  if (preset.negative) {
    preset.negative.forEach((modifier, index) => {
      BANNED_VERBS.forEach((verb) => {
        const regex = new RegExp(`\\b${verb}\\b`, 'i')
        if (regex.test(modifier)) {
          errors.push(`Negative modifier ${index + 1} contains banned verb "${verb}": "${modifier}"`)
        }
      })
    })
  }

  // Check description
  if (preset.description) {
    BANNED_VERBS.forEach((verb) => {
      const regex = new RegExp(`\\b${verb}\\b`, 'i')
      if (regex.test(preset.description)) {
        errors.push(`Description contains banned verb "${verb}": "${preset.description}"`)
      }
    })
  }

  // Check background
  if (preset.background) {
    const bg = preset.background as string
    BANNED_VERBS.forEach((verb) => {
      const regex = new RegExp(`\\b${verb}\\b`, 'i')
      if (regex.test(bg)) {
        errors.push(`Background contains banned verb "${verb}": "${bg}"`)
      }
    })
  }

  // Note: Legacy instructions field removed from interface for safety

  return {
    valid: errors.length === 0,
    errors,
  }
}

