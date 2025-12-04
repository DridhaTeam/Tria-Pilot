/**
 * Try-On Style Presets (Safe Version)
 * All presets follow the required structure with positive/negative arrays
 * No banned verbs (add, change, alter, modify, transform, adjust, replace, remove, reposition, rotate, tilt)
 * Presets only influence scene mood, colors, lighting, camera feel and ambience
 */

export interface TryOnPreset {
  id: string
  name: string
  description: string
  category: 'casual' | 'studio' | 'outdoor' | 'artistic' | 'cinematic' | 'lifestyle' | 'fashion' | 'portrait'
  positive: string[] // Positive modifiers - scene atmosphere only
  negative: string[] // Negative modifiers - what to avoid
  deviation: number // 0-1, artistic deviation allowed (lower = stricter)
  safe: true
  background?: string // Background description (atmosphere only)
  lighting?: {
    type: string
    source: string
    direction: string
    quality: string
    colorTemp: string
  }
  camera_style?: {
    angle: string
    lens: string
    framing: string
    depthOfField?: string
  }
}

export const tryOnPresets: TryOnPreset[] = [
  {
    id: 'cinematic_daylight',
    name: 'Cinematic Daylight',
    description: 'Clean natural sunlight, soft shadows, film-like tones.',
    category: 'cinematic',
    positive: [
      'Scene expresses bright natural daylight ambience',
      'Colors appear clean and softly cinematic',
      'Background interpreted with gentle highlights',
      'Camera feel resembles a bright modern portrait',
    ],
    negative: [
      'No reinterpretation of facial structure',
      'No changes to pose or anatomy',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Bright natural daylight environment with soft shadows',
    lighting: {
      type: 'natural sunlight',
      source: 'daylight',
      direction: 'soft directional',
      quality: 'crisp, clean',
      colorTemp: 'warm daylight',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '35mm',
      framing: 'medium shot',
      depthOfField: 'shallow',
    },
  },
  {
    id: 'hyper_real',
    name: 'Hyper Real Portrait',
    description: 'Ultra sharp skin texture, extremely crisp lighting.',
    category: 'portrait',
    positive: [
      'Scene expresses photojournalistic realism',
      'Lighting emphasizes authentic skin texture',
      'Camera feel captures high-detail portrait aesthetic',
      'Atmosphere conveys documentary-style authenticity',
    ],
    negative: [
      'No plastic or artificial skin appearance',
      'No over-sharpening artifacts',
      'No digital blur or smoothing',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Neutral studio or natural environment',
    lighting: {
      type: 'crisp studio lighting',
      source: 'studio lights',
      direction: 'directional',
      quality: 'sharp, high contrast',
      colorTemp: 'neutral',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '85mm portrait',
      framing: 'close-up to medium',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'korean_softlight',
    name: 'Korean Soft Light',
    description: 'Diffused pastel tones, smooth lighting, beauty aesthetic.',
    category: 'portrait',
    positive: [
      'Scene expresses creamy soft light ambience',
      'Colors appear balanced with pastel-friendly tones',
      'Background interpreted with gentle highlights',
      'Camera feel resembles beauty portrait photography',
    ],
    negative: [
      'No oversmoothing or anime-like appearance',
      'No neon artifacts or harsh colors',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Soft pastel-friendly environment',
    lighting: {
      type: 'diffused soft light',
      source: 'softbox or window',
      direction: 'even, diffused',
      quality: 'creamy, smooth',
      colorTemp: 'warm neutral',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '50mm standard',
      framing: 'medium shot',
      depthOfField: 'soft',
    },
  },
  {
    id: 'japanese_street',
    name: 'Japanese Street Editorial',
    description: 'Urban minimal style with muted tones.',
    category: 'fashion',
    positive: [
      'Scene expresses urban minimal aesthetic',
      'Colors appear muted with Tokyo-inspired toning',
      'Background interpreted with street textures and reflective surfaces',
      'Camera feel resembles editorial street photography',
    ],
    negative: [
      'No dark silhouettes or loss of detail',
      'No grainy film damage or artifacts',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Urban street environment with minimal aesthetic',
    lighting: {
      type: 'urban ambient',
      source: 'natural + urban',
      direction: 'mixed',
      quality: 'muted, minimal',
      colorTemp: 'cool neutral',
    },
    camera_style: {
      angle: 'eye-level to low',
      lens: '35mm wide',
      framing: 'full body to medium',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'fashion_editorial',
    name: 'Fashion Editorial Studio',
    description: 'High-end magazine vibe.',
    category: 'fashion',
    positive: [
      'Scene expresses high-end fashion editorial atmosphere',
      'Lighting emphasizes studio rim light aesthetic',
      'Background interpreted with clean professional setting',
      'Camera feel resembles magazine photography',
    ],
    negative: [
      'No runway crowds or busy backgrounds',
      'No messy or cluttered composition',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Clean professional studio environment',
    lighting: {
      type: 'studio rim lighting',
      source: 'studio lights',
      direction: 'rim/edge lighting',
      quality: 'sharp, professional',
      colorTemp: 'neutral',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '85mm portrait',
      framing: 'full body to medium',
      depthOfField: 'shallow',
    },
  },
  {
    id: 'fitness_photoshoot',
    name: 'Fitness Photoshoot',
    description: 'Gym aesthetic with sharp highlights.',
    category: 'studio',
    positive: [
      'Scene expresses dynamic fitness photography atmosphere',
      'Lighting emphasizes sharp highlights and definition',
      'Background interpreted with gym or studio setting',
      'Camera feel resembles athletic photography',
    ],
    negative: [
      'No body distortion or unrealistic proportions',
      'No comic exaggeration or artificial enhancement',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Gym or fitness studio environment',
    lighting: {
      type: 'dramatic studio',
      source: 'studio lights',
      direction: 'directional with rim',
      quality: 'sharp, high contrast',
      colorTemp: 'neutral to cool',
    },
    camera_style: {
      angle: 'low to eye-level',
      lens: '24-70mm',
      framing: 'full body',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'luxury_lifestyle',
    name: 'Luxury Lifestyle',
    description: 'Bright, wealthy, elegant appearance.',
    category: 'lifestyle',
    positive: [
      'Scene expresses luxury lifestyle atmosphere',
      'Lighting emphasizes soft luxury aesthetic',
      'Background interpreted with premium surfaces and elegant setting',
      'Camera feel resembles high-end lifestyle photography',
    ],
    negative: [
      'No over-saturated or artificial colors',
    ],
    deviation: 0.12,
    safe: true,
    background: 'Luxury lifestyle environment with premium surfaces',
    lighting: {
      type: 'soft luxury lighting',
      source: 'natural + ambient',
      direction: 'soft directional',
      quality: 'elegant, refined',
      colorTemp: 'warm',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '50mm standard',
      framing: 'medium to full body',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'wedding_soft',
    name: 'Wedding Soft Glow',
    description: 'Warm romantic tones with light bloom.',
    category: 'portrait',
    positive: [
      'Scene expresses romantic wedding photography atmosphere',
      'Lighting emphasizes soft bloom highlights',
      'Background interpreted with creamy whites and romantic tones',
      'Camera feel resembles wedding portrait photography',
    ],
    negative: [
      'No yellow cast or color imbalance',
    ],
    deviation: 0.12,
    safe: true,
    background: 'Romantic wedding setting with soft tones',
    lighting: {
      type: 'soft romantic glow',
      source: 'natural + soft fill',
      direction: 'soft directional',
      quality: 'creamy, blooming',
      colorTemp: 'warm',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '85mm portrait',
      framing: 'medium to full body',
      depthOfField: 'soft',
    },
  },
  {
    id: 'travel_outdoor',
    name: 'Travel Outdoor',
    description: 'Bright sky, open composition.',
    category: 'outdoor',
    positive: [
      'Scene expresses bright outdoor travel atmosphere',
      'Colors appear natural with wide-angle feel',
      'Background interpreted with natural elements and open sky',
      'Camera feel resembles travel photography',
    ],
    negative: [
      'No crowded frame or cluttered composition',
      'No harsh HDR or over-processed appearance',
    ],
    deviation: 0.2,
    safe: true,
    background: 'Outdoor travel environment with natural elements',
    lighting: {
      type: 'natural outdoor',
      source: 'sunlight',
      direction: 'natural',
      quality: 'bright, open',
      colorTemp: 'daylight',
    },
    camera_style: {
      angle: 'eye-level to low',
      lens: '24mm wide',
      framing: 'wide to full body',
      depthOfField: 'deep',
    },
  },
  {
    id: 'studio_highkey',
    name: 'Studio High-Key',
    description: 'Bright white background with clean layout.',
    category: 'studio',
    positive: [
      'Scene expresses bright high-key studio atmosphere',
      'Lighting emphasizes pure white backdrop aesthetic',
      'Background interpreted with soft diffused fill lighting',
      'Camera feel resembles clean product photography',
    ],
    negative: [
      'No deep shadows or moody contrast',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Pure white studio backdrop',
    lighting: {
      type: 'high-key studio',
      source: 'multiple softboxes',
      direction: 'even, diffused',
      quality: 'bright, clean',
      colorTemp: 'neutral',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '50mm standard',
      framing: 'full body to medium',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'studio_rimlight',
    name: 'Studio Rim Light',
    description: 'Edge-lit portrait with cinematic edges.',
    category: 'studio',
    positive: [
      'Scene expresses cinematic rim light atmosphere',
      'Lighting emphasizes clean outline glow',
      'Background interpreted with dramatic edge lighting',
      'Camera feel resembles cinematic portrait photography',
    ],
    negative: [
      'No overexposed halos or blown highlights',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Dark or neutral studio environment',
    lighting: {
      type: 'rim/edge lighting',
      source: 'back/rim lights',
      direction: 'from behind/sides',
      quality: 'cinematic, dramatic',
      colorTemp: 'neutral to cool',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '85mm portrait',
      framing: 'medium to close-up',
      depthOfField: 'shallow',
    },
  },
  {
    id: 'instagram_clean',
    name: 'Instagram Clean Aesthetic',
    description: 'Bright, pastel-friendly portrait.',
    category: 'lifestyle',
    positive: [
      'Scene expresses clean Instagram aesthetic',
      'Colors appear soft with muted tones',
      'Background interpreted with pastel-friendly environment',
      'Camera feel resembles social media photography',
    ],
    negative: [
      'No washed-out faces or loss of detail',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Clean pastel-friendly environment',
    lighting: {
      type: 'soft diffused',
      source: 'natural window or softbox',
      direction: 'soft directional',
      quality: 'clean, pastel-friendly',
      colorTemp: 'warm neutral',
    },
    camera_style: {
      angle: 'eye-level',
      lens: '50mm standard',
      framing: 'medium shot',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'christmas_market',
    name: 'Christmas Market',
    description: 'Cozy festive scene with warm golden fairy lights',
    category: 'outdoor',
    positive: [
      'Scene expresses cozy festive Christmas market atmosphere',
      'Colors appear warm with golden fairy light tones',
      'Background interpreted with twinkle lights and wooden stalls',
      'Camera feel resembles warm holiday photography',
    ],
    negative: [
      'No reinterpretation of facial structure',
      'No changes to pose or anatomy',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Outdoor Christmas market with twinkle lights, wooden stalls, warm hanging lanterns',
    lighting: {
      type: 'warm golden fairy-light glow',
      source: 'Christmas market lights and lanterns',
      direction: 'ambient festive lighting',
      quality: 'soft, warm, cozy',
      colorTemp: 'warm golden',
    },
    camera_style: {
      angle: 'low-to-mid angle',
      lens: 'slight wide-angle with warm bloom',
      framing: 'subject centered among Christmas lights',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'indoor_selfie',
    name: 'Indoor Selfie',
    description: 'Bright indoor setting with natural daylight from large window',
    category: 'lifestyle',
    positive: [
      'Scene expresses bright indoor selfie atmosphere',
      'Lighting emphasizes warm diffused sunlight',
      'Background interpreted with natural window light and cozy interior',
      'Camera feel resembles smartphone selfie photography',
    ],
    negative: [
      'No reinterpretation of facial structure',
      'No changes to pose or anatomy',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Bright indoor setting, natural daylight from large window, light gray walls, flowing white curtains, hints of green plants',
    lighting: {
      type: 'warm diffused sunlight',
      source: 'natural daylight from large window',
      direction: 'side-lighting from window',
      quality: 'soft, diffused',
      colorTemp: 'warm',
    },
    camera_style: {
      angle: 'eye-level',
      lens: 'standard smartphone',
      framing: 'medium shot',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'minimal_studio',
    name: 'Minimal Studio',
    description: 'Clean minimal studio with soft cinematic lighting',
    category: 'studio',
    positive: [
      'Scene expresses minimal studio atmosphere',
      'Lighting emphasizes soft cinematic aesthetic',
      'Background interpreted with minimal lavender studio setting',
      'Camera feel resembles clean modern portrait photography',
    ],
    negative: [
      'No reinterpretation of facial structure',
      'No changes to pose or anatomy',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Minimal lavender studio background',
    lighting: {
      type: 'soft cinematic lighting',
      source: 'studio lights',
      direction: 'soft directional',
      quality: 'soft, diffused',
      colorTemp: 'neutral',
    },
    camera_style: {
      angle: 'eye-level',
      lens: 'portrait lens',
      framing: 'full-body portrait',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'iphone_cafe_minimal',
    name: 'iPhone Café Minimal',
    description: 'Minimal café ambience, neutral tones, overhead lighting',
    category: 'lifestyle',
    positive: [
      'Atmosphere expresses minimalist café setting',
      'Neutral tone palette with soft overhead illumination',
      'Authentic smartphone perspective and framing',
      'Clean highlights with subtle reflections',
      'Subtle natural film grain',
      'Realistic fabric and skin texture fidelity',
    ],
    negative: [
      'No identity drift',
      'No pose deviation',
      'No background content changes',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Minimal café interior with neutral tones',
    lighting: {
      type: 'overhead ambient',
      source: 'ceiling practicals',
      direction: 'top-down soft',
      quality: 'neutral, clean',
      colorTemp: 'neutral-warm',
    },
    camera_style: {
      angle: 'eye-level',
      lens: 'smartphone standard',
      framing: 'medium to close',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'alpine_cyberhiker_diffused',
    name: 'Alpine Cyberhiker Diffused',
    description: 'Technical alpine look with soft diffused daylight',
    category: 'outdoor',
    positive: [
      'Atmosphere expresses rugged alpine ambience',
      'Textures emphasized on rock and technical fabric',
      'Soft diffused natural daylight',
      'Subtle candid smartphone tilt feel',
      'Subtle natural film grain',
      'Realistic fabric and skin texture fidelity',
    ],
    negative: [
      'No identity drift',
      'No pose deviation',
      'No exaggerated bloom or artifacts',
    ],
    deviation: 0.12,
    safe: true,
    background: 'Rugged rock wall within mountainous terrain',
    lighting: {
      type: 'diffused daylight',
      source: 'indirect sky light',
      direction: 'soft lateral',
      quality: 'cinematic yet natural',
      colorTemp: 'daylight neutral',
    },
    camera_style: {
      angle: 'side profile, eye-level',
      lens: 'smartphone wide-standard',
      framing: 'medium to close',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'italian_bar_terracotta',
    name: 'Italian Bar Terracotta',
    description: 'Warm terracotta ambience with casual elegance',
    category: 'lifestyle',
    positive: [
      'Atmosphere expresses rustic Italian street café',
      'Warm terracotta background toning',
      'Natural late-morning sunlight with gentle highlights',
      'Casual candid smartphone aesthetic',
      'Subtle natural film grain',
      'Realistic fabric and skin texture fidelity',
    ],
    negative: [
      'No identity drift',
      'No pose deviation',
      'No heavy bloom or oversaturation',
    ],
    deviation: 0.12,
    safe: true,
    background: 'Weathered terracotta walls with green shutters',
    lighting: {
      type: 'natural sunlight',
      source: 'late-morning sun',
      direction: 'soft side-light',
      quality: 'warm, nuanced',
      colorTemp: 'warm daylight',
    },
    camera_style: {
      angle: 'eye-level with slight tilt',
      lens: 'smartphone standard',
      framing: 'medium',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'alpine_gorpcore_overcast',
    name: 'Alpine Gorpcore Overcast',
    description: 'Outdoor gorpcore, overcast alpine slopes',
    category: 'outdoor',
    positive: [
      'Atmosphere expresses pristine alpine wilderness',
      'Slightly overcast daylight with gentle shadows',
      'Natural grass and rugged rock textures accented',
      'Casual candid smartphone framing with slight tilt',
      'Subtle natural film grain',
      'Realistic fabric and skin texture fidelity',
    ],
    negative: [
      'No identity drift',
      'No pose deviation',
      'No HDR or over-processed look',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Grassy slope beside rugged rocks; distant misty ridges',
    lighting: {
      type: 'overcast ambient',
      source: 'diffused daylight',
      direction: 'soft global',
      quality: 'gentle, even',
      colorTemp: 'cool-neutral daylight',
    },
    camera_style: {
      angle: 'eye-level, slight tilt',
      lens: 'smartphone wide',
      framing: 'full to medium body',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'parisian_street_ivory_silk',
    name: 'Parisian Street Neutral Day',
    description: 'Soft daylight on urban stone textures; casual street feel',
    category: 'fashion',
    positive: [
      'Atmosphere expresses authentic Parisian street textures',
      'Soft natural daylight revealing fabric and skin details',
      'Subtle candid smartphone tilt and off-center framing',
      'Clean neutral toning with realistic micro-textures',
      'Subtle natural film grain',
      'Realistic fabric and skin texture fidelity',
    ],
    negative: [
      'No identity drift',
      'No pose deviation',
      'No excessive smoothing or plastic skin',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Textured Parisian stone wall and city sidewalk',
    lighting: {
      type: 'soft daylight',
      source: 'open shade',
      direction: 'gentle frontal-side',
      quality: 'natural, detailed',
      colorTemp: 'neutral',
    },
    camera_style: {
      angle: 'overhead-slight tilt',
      lens: 'smartphone standard',
      framing: 'medium',
      depthOfField: 'moderate',
    },
  },
  {
    id: 'urban_tunnel_selfie',
    name: 'Urban Tunnel Selfie',
    description: 'Soft diffused tunnel light, close handheld perspective',
    category: 'portrait',
    positive: [
      'Atmosphere expresses neutral-toned underground tunnel',
      'Soft diffused lighting with subtle highlights',
      'Clean handheld smartphone selfie perspective',
      'Authentic skin texture and realistic detail',
      'Subtle natural film grain',
      'Realistic fabric and skin texture fidelity',
    ],
    negative: [
      'No identity drift',
      'No pose deviation',
      'No heavy bloom or artificial color shifts',
    ],
    deviation: 0.1,
    safe: true,
    background: 'Neutral-toned underground tunnel textures',
    lighting: {
      type: 'diffused ambient',
      source: 'tunnel practicals',
      direction: 'soft frontal',
      quality: 'subtle, clean',
      colorTemp: 'cool-neutral',
    },
    camera_style: {
      angle: 'close selfie eye-level',
      lens: 'smartphone front camera',
      framing: 'close-up',
      depthOfField: 'shallow to moderate',
    },
  },
]

/**
 * Get preset by ID
 */
export function getPresetById(id: string): TryOnPreset | undefined {
  return tryOnPresets.find((p) => p.id === id)
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: TryOnPreset['category']): TryOnPreset[] {
  return tryOnPresets.filter((p) => p.category === category)
}

/**
 * Get all presets
 */
export function getAllPresets(): TryOnPreset[] {
  return tryOnPresets
}
