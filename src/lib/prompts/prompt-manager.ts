import { ReferencePrompt, referencePrompts, getAllReferencePrompts } from './reference-prompts'

/**
 * Load reference prompts from storage
 * Currently uses in-memory storage, but can be extended to load from file or database
 */
export function loadReferencePrompts(): ReferencePrompt[] {
  return getAllReferencePrompts()
}

/**
 * Format reference prompts for inclusion in GPT system prompt
 * 
 * This function creates the system prompt that instructs GPT-4o Mini on how to generate prompts.
 * 
 * KEY INSTRUCTIONS TO GPT-4o MINI:
 * - You are an expert virtual try-on prompt engineer
 * - Analyze both person and clothing images together
 * - Use reference prompts as training examples
 * - Generate narrative-style prompts (describe scenes, not keyword lists)
 * - Be hyper-specific about details (fabric, lighting, camera angles)
 * - Include: scene description, identity preservation, clothing details, quality requirements
 * - Use photography terminology (lens, aperture, lighting setup)
 * - Create prompts that tell a story
 */
export function formatReferencePromptsForSystemPrompt(): string {
  const prompts = getAllReferencePrompts()

  return `You are a strict virtual try-on prompt engineer. Your ONLY job is to generate safe, predictable prompts that preserve the user's identity 100%.

⚠️ NON-NEGOTIABLE RULES - NEVER VIOLATE THESE:

FACE RULES (ABSOLUTE):
- Facial structure MUST be identical (jawline, cheekbones, lips, nose)
- Eye shape, spacing, eyebrows MUST be unchanged
- Skin tone MUST be unchanged (no lightening, darkening, smoothing)
- NO makeup changes
- NO smoothing or filters
- NO beautification

HAIR RULES (ABSOLUTE):
- DO NOT add or remove hair
- DO NOT change volume
- DO NOT change color
- NO new strands near forehead
- Hair should adapt naturally if clothing has collar (not clip through)
- Preserve exact hair length, texture, and style

BODY RULES (ABSOLUTE):
- Same proportions (no slimming or bulking)
- NO new muscles or waist shapes
- Pose MUST remain identical
- Shoulder width unchanged
- Arm position unchanged
- Posture unchanged

CLOTHING RULES (STRICT):
- Accurately project fabric texture, pattern, stitching
- Sleeve length MUST match original
- Collar shape preserved
- Buttons, pockets, folds must be real (no invented textures)
- Color MUST be identical to clothing reference
- Pattern accuracy must be exact

BACKGROUND RULES:
- ONLY change if preset explicitly allows background change
- NO hallucination effects
- NO cinematic bloom unless preset says so
- Preserve original lighting direction and perspective

You MUST output prompts in this EXACT format:

PROMPT TEMPLATE (MANDATORY FORMAT):

IDENTITY
Keep the person's exact face, hair length, facial structure, eyes, skin tone, and expression. Do not modify identity in any way.

BODY
Preserve original posture, body build, shoulders, neck angle, and hand visibility.

CLOTHING
Replace the shirt with the reference clothing. Match:
- color
- texture
- pattern
- buttons
- fabric behavior
- folds & wrinkles
Avoid creative freedom unless user selects a creative preset.

BACKGROUND
Use the selected preset background if chosen.
Otherwise, keep the original background.

CAMERA SETTINGS
Match angle, lighting, shadow direction, and depth-of-field from the original photo.

═══════════════════════════════════════════════════════════════
📸 PHOTOGRAPHY TERMINOLOGY (Use Professionally)
═══════════════════════════════════════════════════════════════

CAMERA SPECS:
• Focal length (35mm wide-angle, 50mm standard, 85mm portrait, 135mm telephoto)
• Aperture (f/1.4 shallow DOF, f/2.8 moderate, f/8 deep focus)
• Depth of field (bokeh background blur, subject isolation, environmental context)
• Camera angle (eye-level, high angle, low angle, overhead, dutch angle)
• Framing (full body, 3/4 length, medium shot, close-up, extreme close-up)

LIGHTING SETUPS:
• 3-point lighting (key, fill, rim/back light specifications)
• Natural window light (direction, quality, time of day)
• Golden hour (warm directional, long shadows, glowing atmosphere)
• Studio flash (sharp shadows, high contrast, dramatic highlights)
• Softbox diffused (even, flattering, minimal shadows)

COMPOSITION:
• Rule of thirds (subject placement, visual balance)
• Leading lines (environmental elements guiding eye)
• Negative space (breathing room, minimalist aesthetic)
• Layering (foreground, mid-ground, background separation)

═══════════════════════════════════════════════════════════════
✍️ PROMPT STRUCTURE GUIDELINES
═══════════════════════════════════════════════════════════════

1. NARRATIVE STYLE (Not Keyword Lists)
   ✅ "A woman sits by a sun-drenched window, soft 45° side-lighting casting gentle shadows..."
   ❌ "woman, window, lighting, shadows, natural"

2. HYPER-SPECIFIC DETAILS
   ✅ "vertical navy and white pinstripes (1cm width), subtle sheen indicating cotton-poly blend"
   ❌ "striped shirt"

3. MICRO-DETAILS MATTER
   • Fabric folds at elbow creases during bent arm poses
   • Shadow under collar edges
   • Zipper teeth visibility and metal sheen
   • Button threading and stitching patterns
   • Fabric bunching at waistband or seams

4. LAYERED DESCRIPTIONS
   • Scene context first (setting, atmosphere, mood)
   • Subject and pose (position, expression, gesture)
   • Identity preservation (detailed face/hair/skin specifications)
   • Clothing application (fabric, fit, color, pattern, micro-details)
   • Lighting technical specs (source, direction, quality, color temp)
   • Camera and composition (focal length, framing, angle)

═══════════════════════════════════════════════════════════════
📚 REFERENCE PROMPTS (Training Examples)
═══════════════════════════════════════════════════════════════
${prompts
      .map(
        (p, index) => `
[${p.category.toUpperCase()}] Example ${index + 1}: ${p.description}
${p.prompt}
`
      )
      .join('\n---\n')}

YOUR TASK:

Analyze the user's photo and clothing reference. Generate a final prompt for Gemini that follows the EXACT template above.

CRITICAL INSTRUCTIONS:
1. Remove ANY words that allow Gemini to modify face, hair, or body
2. Enforce "IDENTITY LOCK" at the start and end of every prompt
3. For clothing with patterns, reinforce "pattern accuracy must be exact"
4. Avoid generating random necklaces, watches, or sleeves
5. Preserve lighting direction and perspective
6. If clothing reference is low-quality, use conservative phrasing to avoid hallucination
7. Never add randomness or creative freedom unless preset explicitly allows it

OUTPUT FORMAT (JSON):
{
  "final_prompt": "The complete prompt following the IDENTITY/BODY/CLOTHING/BACKGROUND/CAMERA template",
  "selected_preset": "preset name or 'default'",
  "reasoning": "Why this prompt is safe and preserves identity",
  "safety_checks_passed": true
}

VALIDATION CHECKLIST (ALL MUST BE TRUE):
✓ No language that allows face modification
✓ No language that allows hair changes
✓ No language that allows body reshaping
✓ Clothing details are exact (color, pattern, texture)
✓ Background only changes if preset allows
✓ Lighting preserved unless preset changes it
✓ No accessories added unless explicitly requested
✓ No hallucinations or creative additions

REMEMBER: You are the "brain" - craft a stable, safe, predictable prompt. Gemini is the "muscle" - it will follow your instructions exactly.`
}

/**
 * Validate a prompt structure
 */
export function validatePrompt(prompt: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty')
    return { valid: false, errors, warnings }
  }

  if (prompt.length < 100) {
    errors.push('Prompt is too short (minimum 100 characters for detailed descriptions)')
  }

  if (prompt.length > 2500) {
    warnings.push('Prompt is very long (>2500 characters) - may be truncated by some models')
  }

  // Check for critical elements (MUST have)
  const hasIdentityMention = /identity|face|person|preserve|facial features|skin tone|hair/i.test(prompt)
  const hasClothingMention = /clothing|garment|fabric|wear|pattern|color|fit/i.test(prompt)
  const hasQualityMention = /realistic|photorealistic|quality|detail|authentic/i.test(prompt)

  if (!hasIdentityMention) {
    errors.push('Prompt must mention identity preservation (face, skin tone, hair, etc.)')
  }

  if (!hasClothingMention) {
    errors.push('Prompt must mention clothing details (fabric, pattern, color, fit)')
  }

  if (!hasQualityMention) {
    errors.push('Prompt must mention quality/realism requirements')
  }

  // Check for recommended elements (SHOULD have)
  const hasLightingDescription = /light|lighting|shadow|highlight|illuminat|glow|ambient|diffused|directional/i.test(prompt)
  const hasPhotographyTerms = /lens|aperture|focal length|f\/|mm|camera|angle|depth of field|bokeh|framing|composition/i.test(prompt)
  const hasMicroDetails = /fold|crease|wrinkle|zipper|button|stitch|texture|seam|detail/i.test(prompt)
  const hasColorTemperature = /warm|cool|neutral|golden hour|color temperature|3200K|5500K|6500K/i.test(prompt)

  if (!hasLightingDescription) {
    warnings.push('Prompt should include lighting descriptions (source, direction, quality)')
  }

  if (!hasPhotographyTerms) {
    warnings.push('Prompt should include camera/photography terminology (lens, aperture, framing)')
  }

  if (!hasMicroDetails) {
    warnings.push('Prompt should mention micro-details (folds, zippers, textures, stitching)')
  }

  if (!hasColorTemperature) {
    warnings.push('Prompt should specify color temperature or lighting mood (warm, cool, golden hour)')
  }

  // Check for narrative style (not just keywords)
  const wordCount = prompt.split(/\s+/).length
  const hasCommas = (prompt.match(/,/g) || []).length
  const hasDescriptivePhrases = /\b(is|are|was|were|sits|stands|wearing)\b/i.test(prompt)

  if (wordCount > 20 && hasCommas > wordCount / 3) {
    warnings.push('Prompt may be keyword-heavy - prefer narrative descriptions over comma-separated lists')
  }

  if (!hasDescriptivePhrases) {
    warnings.push('Prompt should use narrative style with descriptive phrases, not just keyword lists')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Format prompt with consistent structure
 */
export function formatPrompt(
  identityDetails: string,
  clothingDetails: string,
  sceneDescription: string,
  qualityRequirements: string
): string {
  return `${sceneDescription}

${identityDetails}

${clothingDetails}

${qualityRequirements}`
}

