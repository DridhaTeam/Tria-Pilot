import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Optimized connection pool configuration for Supabase pooler
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 8, // Optimized for Supabase pooler (typically limits to 5-10)
    min: 1, // Minimum connections
    idleTimeoutMillis: 10000, // Faster cleanup (10 seconds)
    connectionTimeoutMillis: 5000, // Faster failure detection (5 seconds)
    allowExitOnIdle: true,
    // Keep connections alive
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })

  // Handle pool errors gracefully
  pool.on('error', (err) => {
    console.error('Database pool error:', err)
    // Don't throw - let Prisma handle reconnection
  })

  // Handle connection errors
  pool.on('connect', (client) => {
    // Set statement timeout to prevent hanging queries
    client.query('SET statement_timeout = 30000').catch((err) => {
      console.error('Failed to set statement timeout:', err)
    })
  })

  // Use the official Prisma pg adapter
  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // Prisma manages connections automatically via pool - no need for explicit $connect()
  // The pool will establish connections on-demand when queries are executed

  return client
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
