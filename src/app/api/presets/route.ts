import { NextResponse } from 'next/server'
import { getPresetList, getAllPresetCategories } from '@/lib/prompts/intelligent-presets'

export async function GET() {
  try {
    const presets = getPresetList()
    const categories = getAllPresetCategories()

    // Group presets by category
    const groupedPresets = categories.reduce((acc, category) => {
      acc[category] = presets.filter(p => p.category === category)
      return acc
    }, {} as Record<string, typeof presets>)

    return NextResponse.json({
      presets,
      categories,
      groupedPresets,
    })
  } catch (error) {
    console.error('Failed to fetch presets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    )
  }
}

