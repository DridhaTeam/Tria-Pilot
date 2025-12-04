// In-memory rate limiting (for development)
// For production, use Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  tryon: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  ads: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  campaigns: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
}

export function checkRateLimit(
  userId: string,
  endpoint: 'tryon' | 'ads' | 'campaigns'
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = defaultConfigs[endpoint]
  const key = `${userId}:${endpoint}`
  const now = Date.now()

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  // Initialize or get current state
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  const current = store[key]

  // Check if limit exceeded
  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  // Increment count
  current.count++

  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime,
  }
}

// Cleanup function to run periodically
export function cleanupRateLimitStore() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

