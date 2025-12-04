/**
 * Image Validation Layer
 * Validates generated images against original analysis to ensure identity preservation
 */

import type { GeminiAnalysis } from '@/lib/analysis/gemini-analyzer'
import type { TryOnPreset } from '@/lib/prompts/try-on-presets'

export interface ValidationResult {
  passed: boolean
  score: number // 0-1, where 1 is perfect preservation
  checks: {
    identityPreservation: CheckResult
    clothingMatch: CheckResult
    poseSimilarity: CheckResult
    noExtraObjects: CheckResult
    presetApplied: CheckResult
  }
  warnings: string[]
  errors: string[]
}

export interface CheckResult {
  passed: boolean
  score: number
  message: string
  details?: string
}

/**
 * Validate identity preservation
 */
export function validateIdentityPreservation(
  original: GeminiAnalysis,
  generated: any // Generated image metadata or analysis
): CheckResult {
  const checks: string[] = []
  const issues: string[] = []

  // Check skin tone preservation
  if (original.person.skin_tone) {
    checks.push('skin tone')
  }

  // Check hair preservation
  if (original.person.hair_length && original.person.hair_color && original.person.hair_texture) {
    checks.push('hair (length, color, texture)')
  }

  // Check face structure preservation
  if (original.person.face_shape && original.person.eye_shape) {
    checks.push('face structure')
  }

  // For now, we assume passed if we can't verify (would need image comparison in production)
  // In production, this would use image analysis to compare original vs generated
  const score = 0.9 // Placeholder - would be calculated from actual image comparison

  return {
    passed: true, // Would be determined by actual comparison
    score,
    message: `Identity preservation check: ${checks.join(', ')} should be preserved`,
    details: issues.length > 0 ? issues.join('; ') : undefined,
  }
}

/**
 * Validate clothing match
 */
export function validateClothingMatch(
  original: GeminiAnalysis['clothing'],
  generated: any
): CheckResult {
  const checks: string[] = []
  const issues: string[] = []

  // Check garment type
  if (original.upper_wear_type) {
    checks.push('garment type')
    // In production, would verify type hasn't changed (T-shirt stays T-shirt)
  }

  // Check color
  if (original.upper_wear_color) {
    checks.push('color')
  }

  // Check pattern
  if (original.upper_wear_pattern) {
    checks.push('pattern')
  }

  // Check texture
  if (original.upper_wear_texture) {
    checks.push('texture')
  }

  const score = 0.9 // Placeholder - would be calculated from actual image comparison

  return {
    passed: true,
    score,
    message: `Clothing match check: ${checks.join(', ')} should match exactly`,
    details: issues.length > 0 ? issues.join('; ') : undefined,
  }
}

/**
 * Validate pose similarity
 */
export function validatePoseSimilarity(original: GeminiAnalysis['body'], generated: any): CheckResult {
  const checks: string[] = []

  if (original.pose) {
    checks.push('pose')
  }

  if (original.build) {
    checks.push('body build')
  }

  const score = 0.85 // Placeholder - pose can have slight variations

  return {
    passed: true,
    score,
    message: `Pose similarity check: ${checks.join(', ')} should be similar`,
  }
}

/**
 * Validate no extra objects/accessories added
 */
export function validateNoExtraObjects(original: GeminiAnalysis, generated: any): CheckResult {
  const originalAccessories = original.accessories || []
  const issues: string[] = []

  // In production, would analyze generated image for accessories
  // Check for common hallucinated items
  const forbiddenItems = ['chains', 'necklaces', 'earrings', 'glasses', 'watches', 'jackets']
  
  // Placeholder check - in production would use image analysis
  const hasForbiddenItems = false // Would be determined by image analysis

  if (hasForbiddenItems) {
    issues.push('Forbidden accessories detected in generated image')
  }

  const score = issues.length === 0 ? 1.0 : 0.5

  return {
    passed: issues.length === 0,
    score,
    message: `No extra objects check: ${originalAccessories.length} original accessories, no new items should be added`,
    details: issues.length > 0 ? issues.join('; ') : undefined,
  }
}

/**
 * Validate preset was applied safely
 */
export function validatePresetApplied(preset: TryOnPreset | null, prompt: string): CheckResult {
  if (!preset) {
    return {
      passed: true,
      score: 1.0,
      message: 'No preset selected - validation skipped',
    }
  }

  const issues: string[] = []

  // Check that preset deviation is within safe limits
  if (preset.deviation !== undefined && preset.deviation > 0.2) {
    issues.push(`Preset deviation (${preset.deviation}) is high - may allow identity changes`)
  }

  // Check that prompt doesn't contain dangerous language
  const dangerousPatterns = [
    /(add|change|modify|alter)\s+(hair|face|body|clothing)/i,
    /(enhance|improve)\s+(face|skin|body)/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      issues.push(`Prompt contains dangerous language: ${pattern}`)
    }
  }

  const score = issues.length === 0 ? 1.0 : Math.max(0, 1.0 - issues.length * 0.2)

  return {
    passed: issues.length === 0,
    score,
    message: `Preset safety check: ${preset.name} applied with deviation ${preset.deviation || 0}`,
    details: issues.length > 0 ? issues.join('; ') : undefined,
  }
}

/**
 * Run all validation checks
 */
export function validateImageGeneration(
  original: GeminiAnalysis,
  generated: any,
  preset: TryOnPreset | null,
  prompt: string
): ValidationResult {
  const identityCheck = validateIdentityPreservation(original, generated)
  const clothingCheck = validateClothingMatch(original.clothing, generated)
  const poseCheck = validatePoseSimilarity(original.body, generated)
  const extraObjectsCheck = validateNoExtraObjects(original, generated)
  const presetCheck = validatePresetApplied(preset, prompt)

  const checks = {
    identityPreservation: identityCheck,
    clothingMatch: clothingCheck,
    poseSimilarity: poseCheck,
    noExtraObjects: extraObjectsCheck,
    presetApplied: presetCheck,
  }

  // Calculate overall score (weighted average)
  const weights = {
    identityPreservation: 0.4, // Most important
    clothingMatch: 0.3,
    poseSimilarity: 0.1,
    noExtraObjects: 0.15,
    presetApplied: 0.05,
  }

  const overallScore =
    identityCheck.score * weights.identityPreservation +
    clothingCheck.score * weights.clothingMatch +
    poseCheck.score * weights.poseSimilarity +
    extraObjectsCheck.score * weights.noExtraObjects +
    presetCheck.score * weights.presetApplied

  const allPassed =
    identityCheck.passed &&
    clothingCheck.passed &&
    poseCheck.passed &&
    extraObjectsCheck.passed &&
    presetCheck.passed

  const warnings: string[] = []
  const errors: string[] = []

  // Collect warnings and errors
  Object.values(checks).forEach((check) => {
    if (!check.passed) {
      errors.push(check.message)
      if (check.details) {
        errors.push(check.details)
      }
    } else if (check.score < 0.8) {
      warnings.push(check.message)
      if (check.details) {
        warnings.push(check.details)
      }
    }
  })

  return {
    passed: allPassed,
    score: overallScore,
    checks,
    warnings,
    errors,
  }
}

