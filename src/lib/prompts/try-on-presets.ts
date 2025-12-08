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
  backgroundElements?: {
    people?: string // Other people in scene (blurred, distant, etc.)
    objects?: string // Objects, props, environmental elements
    atmosphere?: string // Crowd, activity level, energy
  }
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
  pose?: {
    stance: string // Body stance description
    arms: string // Arm position/gesture
    expression: string // Facial expression mood
    energy: 'relaxed' | 'confident' | 'dynamic' | 'casual' | 'elegant' | 'powerful'
    bodyAngle?: string // Body angle relative to camera
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
    backgroundElements: {
      people: 'Distant blurred pedestrians walking naturally, casual passersby',
      objects: 'Street benches, potted plants, parked bicycles, cafe umbrellas in distance',
      atmosphere: 'Calm urban morning, light foot traffic, relaxed city vibe',
    },
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
    pose: {
      stance: 'Relaxed natural standing, weight slightly shifted',
      arms: 'Natural hang at sides or one hand in pocket',
      expression: 'Calm, approachable, slight natural smile',
      energy: 'relaxed',
      bodyAngle: 'Slight three-quarter turn toward camera',
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
    backgroundElements: {
      people: 'None - clean studio isolation for focus on subject',
      objects: 'Minimal studio equipment edges visible, professional reflector hints',
      atmosphere: 'Professional photoshoot setting, controlled environment',
    },
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
    pose: {
      stance: 'Upright with squared shoulders, grounded stance',
      arms: 'Hands relaxed at sides or one resting on hip',
      expression: 'Confident, direct gaze, neutral to subtle smile',
      energy: 'confident',
      bodyAngle: 'Facing camera directly',
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
    backgroundElements: {
      people: 'None or very subtle soft silhouettes in far background',
      objects: 'Soft fabric drapes, pastel flowers, gentle furniture edges',
      atmosphere: 'Dreamy beauty studio, delicate and calm',
    },
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
    pose: {
      stance: 'Soft elegant posture, slight hip tilt',
      arms: 'Gentle hand gestures near face or relaxed at sides',
      expression: 'Soft, dreamy, gentle smile or serene look',
      energy: 'elegant',
      bodyAngle: 'Slight angle, chin down slightly',
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
    backgroundElements: {
      people: 'Blurred Japanese commuters, stylish locals with umbrellas, distant salarymen',
      objects: 'Vending machines, neon signs (soft blur), utility poles, crosswalk markings',
      atmosphere: 'Busy Tokyo street, urban energy, modern minimalism',
    },
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
    pose: {
      stance: 'Cool urban stance, one foot forward, weight shifted',
      arms: 'Hands in pockets or crossing chest loosely',
      expression: 'Composed, cool, street-style attitude',
      energy: 'casual',
      bodyAngle: 'Three-quarter angle, looking away or at camera',
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
    backgroundElements: {
      people: 'Subtle glimpse of stylists or photographers in extreme background blur',
      objects: 'Clothing racks with designer pieces, studio lights, fashion magazines',
      atmosphere: 'High-end fashion studio, exclusive editorial shoot',
    },
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
    pose: {
      stance: 'Strong fashion stance, elongated posture, hips angled',
      arms: 'Editorial arm positions - akimbo, raised, or structured',
      expression: 'High-fashion attitude, piercing gaze, no smile',
      energy: 'powerful',
      bodyAngle: 'Strong three-quarter or profile angle',
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
    backgroundElements: {
      people: 'Other gym-goers working out in blurred background, trainer silhouette',
      objects: 'Dumbbells, weight racks, gym machines, medicine balls, resistance bands',
      atmosphere: 'Active gym floor, motivating fitness environment, workout energy',
    },
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
    pose: {
      stance: 'Athletic power stance, engaged core, strong legs',
      arms: 'Arms engaged - flexed, on hips, or mid-motion',
      expression: 'Focused determination, intense gaze',
      energy: 'dynamic',
      bodyAngle: 'Power angle showing definition',
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
    backgroundElements: {
      people: 'Elegant server or concierge in far background, well-dressed patrons blur',
      objects: 'Champagne glasses, marble surfaces, designer furniture, art pieces, fresh flowers',
      atmosphere: 'Exclusive hotel lobby or upscale lounge, refined luxury ambience',
    },
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
    pose: {
      stance: 'Refined elegant posture, poised and relaxed',
      arms: 'One arm relaxed, other perhaps touching jewelry or collar',
      expression: 'Satisfied, confident, subtle knowing smile',
      energy: 'elegant',
      bodyAngle: 'Graceful three-quarter angle',
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
    backgroundElements: {
      people: 'Blurred wedding guests in distance, bridesmaids softly visible',
      objects: 'Floral arrangements, white chairs, draped fabric, fairy lights, champagne glasses',
      atmosphere: 'Romantic outdoor ceremony or elegant reception venue',
    },
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
    pose: {
      stance: 'Graceful romantic posture, flowing and soft',
      arms: 'Gentle gestures, bouquet hold, or hands clasped',
      expression: 'Joyful, romantic, genuine happiness',
      energy: 'elegant',
      bodyAngle: 'Soft angle, chin lifted slightly',
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
    backgroundElements: {
      people: 'Other travelers in distance, locals going about daily life, tour group blur',
      objects: 'Historic buildings, natural landmarks, travel bags, cafe tables, street signs',
      atmosphere: 'Vibrant travel destination, exploration energy, memorable location',
    },
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
    pose: {
      stance: 'Adventurous open stance, explorer vibe',
      arms: 'Arms open, hands on hips, or shielding eyes from sun',
      expression: 'Happy, adventurous, genuine joy',
      energy: 'dynamic',
      bodyAngle: 'Open to landscape, facing camera or looking ahead',
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
    backgroundElements: {
      people: 'None - clean studio isolation',
      objects: 'Subtle floor reflection, minimal studio equipment shadows',
      atmosphere: 'Professional commercial studio, clean and bright',
    },
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
    pose: {
      stance: 'Clean professional stance, balanced posture',
      arms: 'Hands relaxed, or one hand on hip for fashion',
      expression: 'Friendly, approachable, commercial smile',
      energy: 'confident',
      bodyAngle: 'Slight angle or directly facing camera',
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
    backgroundElements: {
      people: 'None - isolated artistic portrait',
      objects: 'Subtle smoke/haze effects, rim light glow visible',
      atmosphere: 'Dramatic cinematic studio, moody and artistic',
    },
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
    pose: {
      stance: 'Dramatic artistic stance, profile or silhouette',
      arms: 'Expressive arm positions for rim light definition',
      expression: 'Mysterious, cinematic intensity',
      energy: 'powerful',
      bodyAngle: 'Profile or strong three-quarter for rim effect',
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
    backgroundElements: {
      people: 'None or very soft blurred friend in conversation distance',
      objects: 'Trendy cafe furniture, plants, neon signs, aesthetic wall art',
      atmosphere: 'Instagram-worthy cafe or influencer studio space',
    },
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
    pose: {
      stance: 'Casual influencer stance, relaxed but photogenic',
      arms: 'Phone selfie angle, or natural hand gesture',
      expression: 'Bright, engaging smile, approachable',
      energy: 'casual',
      bodyAngle: 'Slight angle, flattering selfie pose',
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
    backgroundElements: {
      people: 'Bundled-up shoppers browsing stalls, families with children, couples holding hands',
      objects: 'Wooden market stalls with crafts, hot cocoa stands, Christmas ornaments, mulled wine cups',
      atmosphere: 'Festive holiday crowd, cozy winter evening, magical Christmas ambiance',
    },
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
    pose: {
      stance: 'Cozy relaxed stance, natural holiday mood',
      arms: 'Holding warm drink, hands in coat pockets, or adjusting scarf',
      expression: 'Warm, cozy smile, holiday joy',
      energy: 'relaxed',
      bodyAngle: 'Natural angle, facing camera or looking at lights',
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
    backgroundElements: {
      people: 'None - intimate personal space',
      objects: 'Houseplants, cozy blankets, books, coffee mug, decorative pillows, fairy lights',
      atmosphere: 'Cozy home interior, personal lifestyle space, morning light vibes',
    },
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
    pose: {
      stance: 'Comfortable home stance, relaxed natural posture',
      arms: 'Phone selfie arm, or hand touching hair/face naturally',
      expression: 'Natural, candid, authentic smile',
      energy: 'casual',
      bodyAngle: 'Selfie angle, slightly above eye level',
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
    backgroundElements: {
      people: 'None - clean studio focus',
      objects: 'Subtle floor shadows, minimal props, clean studio floor',
      atmosphere: 'Modern minimalist studio, clean and serene',
    },
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
    pose: {
      stance: 'Clean minimal stance, simple and elegant',
      arms: 'Relaxed at sides, one hand touching opposite arm',
      expression: 'Calm, neutral, confident',
      energy: 'relaxed',
      bodyAngle: 'Facing camera or slight angle',
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
    backgroundElements: {
      people: 'Fellow cafe patrons reading or working on laptops, blurred barista',
      objects: 'Coffee cups, pastries, wooden tables, exposed brick, pendant lights, menu boards',
      atmosphere: 'Quiet minimalist cafe, creative work environment, urban coffee culture',
    },
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
    pose: {
      stance: 'Casual café sitting or leaning pose',
      arms: 'One hand holding coffee cup, other relaxed',
      expression: 'Relaxed, contemplative, natural',
      energy: 'casual',
      bodyAngle: 'Candid angle, slightly off-center',
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
    backgroundElements: {
      people: 'Other hikers on distant trail, climbing partners in far background',
      objects: 'Hiking poles, carabiners, rock formations, alpine flowers, trail markers',
      atmosphere: 'Remote alpine wilderness, adventurous outdoor exploration',
    },
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
    pose: {
      stance: 'Rugged explorer stance, grounded on rocky terrain',
      arms: 'Adjusting backpack strap, or hands on hips surveying',
      expression: 'Focused, determined, adventurous',
      energy: 'dynamic',
      bodyAngle: 'Profile or three-quarter, looking at landscape',
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
    backgroundElements: {
      people: 'Italian locals chatting at nearby tables, elderly man reading newspaper',
      objects: 'Espresso cups, Vespa scooter, wine bottles, outdoor chairs, potted geraniums',
      atmosphere: 'Authentic Italian street life, leisurely Mediterranean pace',
    },
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
    pose: {
      stance: 'European casual elegance, leaning against wall',
      arms: 'Crossed, or one hand holding espresso/wine',
      expression: 'Relaxed sophistication, slight knowing smile',
      energy: 'elegant',
      bodyAngle: 'Leaning casually, facing camera',
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
    backgroundElements: {
      people: 'Fellow hikers in distance on grassy trail, shepherd with flock far away',
      objects: 'Hiking boots visible, wildflowers, rocky outcrops, distant mountain hut',
      atmosphere: 'Peaceful alpine meadow, fresh mountain air, nature retreat',
    },
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
    pose: {
      stance: 'Outdoor hiking stance, relaxed but ready',
      arms: 'Thumbs in backpack straps, or gesturing at landscape',
      expression: 'Content, peaceful, enjoying nature',
      energy: 'relaxed',
      bodyAngle: 'Candid angle, looking at camera or ahead',
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
    backgroundElements: {
      people: 'Stylish Parisians walking past, couple at bistro table, artist with easel',
      objects: 'Parisian street signs, cafe chairs, baguettes in basket, bicycle, vintage lamppost',
      atmosphere: 'Chic Paris arrondissement, fashion-forward street culture',
    },
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
    pose: {
      stance: 'Chic street stance, casual French elegance',
      arms: 'Bag over shoulder, hand in pocket, or adjusting hair',
      expression: 'Effortlessly cool, subtle confident smile',
      energy: 'casual',
      bodyAngle: 'Street-style angle, walking or paused mid-stride',
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
    backgroundElements: {
      people: 'Blurred commuters passing by, street musician in distance',
      objects: 'Tunnel tiles, urban graffiti hints, directional signs, metro map',
      atmosphere: 'Urban underground, city transit vibes, edgy street culture',
    },
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
    pose: {
      stance: 'Urban selfie stance, casual and confident',
      arms: 'Phone held for selfie, other hand relaxed or in pocket',
      expression: 'Cool urban attitude, slight smirk or neutral',
      energy: 'confident',
      bodyAngle: 'Slightly angled for flattering selfie',
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
