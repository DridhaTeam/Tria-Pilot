/**
 * Intelligent Scenario Selector
 * 
 * Uses GPT-4o mini to analyze input images and automatically select
 * the best scenario from a preset's 100 variations.
 */

import OpenAI from 'openai'
import { getOpenAI } from '@/lib/openai'
import { 
  IntelligentPreset, 
  ScenarioVariation, 
  getIntelligentPreset,
  buildPresetPromptFromScenario 
} from './intelligent-presets'

export interface ScenarioSelectionInput {
  personImage: string // base64
  clothingImage?: string // base64 (optional)
  preset: IntelligentPreset
  userInstruction?: string
}

export interface ScenarioSelectionResult {
  selectedScenario: ScenarioVariation
  personDescription: string
  garmentDescription: string
  finalPrompt: string
  reasoning: string
}

/**
 * GPT-4o mini analyzes the images and selects the best scenario
 * from the preset's 100 variations
 */
export async function selectBestScenario(
  input: ScenarioSelectionInput
): Promise<ScenarioSelectionResult> {
  const { personImage, clothingImage, preset, userInstruction } = input

  const openaiClient = getOpenAI()

  const formatImageUrl = (base64: string) => {
    if (base64.startsWith('data:image/')) {
      return base64
    }
    return `data:image/jpeg;base64,${base64}`
  }

  // Build image inputs
  const imageInputs: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []

  imageInputs.push({
    type: 'image_url',
    image_url: {
      url: formatImageUrl(personImage),
      detail: 'high',
    },
  })

  if (clothingImage) {
    imageInputs.push({
      type: 'image_url',
      image_url: {
        url: formatImageUrl(clothingImage),
        detail: 'high',
      },
    })
  }

  // Prepare scenario options for GPT to choose from
  // Send a subset of key scenarios (10 representative ones) to reduce token usage
  const scenarioSamples = selectRepresentativeScenarios(preset.scenarios, 10)
  
  const scenarioOptionsText = scenarioSamples.map((s, idx) => `
SCENARIO ${idx + 1} (${s.id}):
  - Background: ${s.background}
  - Camera: ${s.camera.angle}, ${s.camera.lens}, ${s.camera.framing}
  - Lighting: ${s.lighting.quality} ${s.lighting.type} ${s.lighting.direction}, ${s.lighting.time}
  - Pose: ${s.pose.stance}, head ${s.pose.headTilt}
  - Expression: ${s.expression}
  - Mood: ${s.mood}
`).join('\n')

  const systemPrompt = `You are an intelligent photography director for a virtual try-on system. Your job is to:

1. Analyze the PERSON IMAGE to understand their current pose, angle, expression, and body position
2. Analyze the GARMENT IMAGE to understand the clothing style, color, and how it should be worn
3. Select the BEST SCENARIO from the options that would:
   - Match naturally with the person's current pose and angle
   - Complement the garment style
   - Create a cohesive, professional-looking result
   - Require minimal pose adjustment (to preserve face consistency)

## PRESET: ${preset.name}
${preset.description}

## AVAILABLE SCENARIOS:
${scenarioOptionsText}

## YOUR TASKS:

1. **Analyze Person**: Describe their face, pose, angle, expression in detail
2. **Analyze Garment**: Describe the clothing (color, pattern, fabric, style) - IGNORE any face in garment image
3. **Select Best Scenario**: Choose the scenario that best matches the person's current pose/angle
4. **Reasoning**: Explain why this scenario works best

## OUTPUT FORMAT (JSON):
{
  "personDescription": "Detailed description of person's face and current pose",
  "garmentDescription": "Detailed description of the garment ONLY (ignore any model wearing it)",
  "selectedScenarioId": "scenario_X",
  "selectedScenarioNumber": X,
  "reasoning": "Why this scenario is the best match for this person and garment"
}

## SELECTION CRITERIA:
- If person is standing straight, prefer scenarios with "standing_straight" or "standing_relaxed"
- If person is at an angle, prefer matching camera angles
- Match the garment formality with the background (formal clothes → elegant settings)
- Consider the person's expression when selecting mood
- Prioritize scenarios that require minimal pose change`

  const userPrompt = `Analyze these images and select the best scenario for the "${preset.name}" preset.

${clothingImage ? 'IMAGE 1: PERSON (identity to preserve)\nIMAGE 2: GARMENT (clothing to apply - ignore any face)' : 'IMAGE 1: PERSON (identity to preserve)'}

${userInstruction ? `USER REQUEST: ${userInstruction}` : ''}

Select the best scenario that matches this person's pose and would look natural with this garment.`

  try {
    console.log(`🎯 GPT-4o mini: Selecting best scenario from "${preset.name}" preset...`)

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            ...imageInputs,
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from GPT-4o mini')
    }

    const parsed = JSON.parse(content) as {
      personDescription: string
      garmentDescription: string
      selectedScenarioId: string
      selectedScenarioNumber: number
      reasoning: string
    }

    // Find the selected scenario
    const selectedScenario = scenarioSamples.find(s => s.id === parsed.selectedScenarioId) 
      || scenarioSamples[parsed.selectedScenarioNumber - 1]
      || scenarioSamples[0] // Fallback to first scenario

    console.log(`✅ Selected scenario: ${selectedScenario.id}`)
    console.log(`   Background: ${selectedScenario.background.slice(0, 50)}...`)
    console.log(`   Reasoning: ${parsed.reasoning.slice(0, 100)}...`)

    // Build the final prompt
    const finalPrompt = buildPresetPromptFromScenario(
      preset,
      selectedScenario,
      parsed.garmentDescription,
      parsed.personDescription,
      userInstruction
    )

    return {
      selectedScenario,
      personDescription: parsed.personDescription,
      garmentDescription: parsed.garmentDescription,
      finalPrompt,
      reasoning: parsed.reasoning,
    }
  } catch (error) {
    console.error('❌ Scenario selection failed:', error)
    
    // Fallback to first scenario
    const fallbackScenario = preset.scenarios[0]
    const fallbackPrompt = buildPresetPromptFromScenario(
      preset,
      fallbackScenario,
      'the garment from the reference image',
      'the person from the input image',
      userInstruction
    )

    return {
      selectedScenario: fallbackScenario,
      personDescription: 'Analysis failed - using default',
      garmentDescription: 'Analysis failed - using default',
      finalPrompt: fallbackPrompt,
      reasoning: 'Fallback to default scenario due to analysis error',
    }
  }
}

/**
 * Select representative scenarios from a larger set
 * Ensures variety in camera angles, lighting, and backgrounds
 */
function selectRepresentativeScenarios(
  scenarios: ScenarioVariation[],
  count: number
): ScenarioVariation[] {
  if (scenarios.length <= count) {
    return scenarios
  }

  const selected: ScenarioVariation[] = []
  const step = Math.floor(scenarios.length / count)

  for (let i = 0; i < count && i * step < scenarios.length; i++) {
    selected.push(scenarios[i * step])
  }

  return selected
}

/**
 * Main function to process a preset-based try-on request
 */
export async function processPresetTryOn(
  presetId: string,
  personImage: string,
  clothingImage: string | undefined,
  userInstruction?: string
): Promise<{
  prompt: string
  scenario: ScenarioVariation
  personDescription: string
  garmentDescription: string
  editTypes: string[]
}> {
  const preset = getIntelligentPreset(presetId)
  
  if (!preset) {
    throw new Error(`Preset not found: ${presetId}`)
  }

  const result = await selectBestScenario({
    personImage,
    clothingImage,
    preset,
    userInstruction,
  })

  return {
    prompt: result.finalPrompt,
    scenario: result.selectedScenario,
    personDescription: result.personDescription,
    garmentDescription: result.garmentDescription,
    editTypes: preset.editTypes,
  }
}

