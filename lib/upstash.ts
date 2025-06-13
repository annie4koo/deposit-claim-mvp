// Upstash KV helpers for storing deposit claims
export interface ClaimData {
  id: string
  tenantName: string
  tenantEmail: string
  landlordEmail?: string
  amount: string
  state: string
  deadline: string
  createdAt: number
  reminderOptIn?: boolean
}

// Mock KV store for development (replace with actual Upstash in production)
class MockKV {
  private data: Map<string, any> = new Map()

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value)
    console.log(`📦 [TEST MODE] Stored claim: ${key}`)
  }

  async get(key: string): Promise<any> {
    return this.data.get(key)
  }

  async del(key: string): Promise<void> {
    this.data.delete(key)
    console.log(`🗑️ [TEST MODE] Deleted claim: ${key}`)
  }

  async scan(cursor: number = 0, pattern?: string): Promise<[number, string[]]> {
    const keys = Array.from(this.data.keys())
    const filteredKeys = pattern 
      ? keys.filter(key => key.includes(pattern.replace('*', '')))
      : keys
    return [0, filteredKeys] // cursor 0 means no more results
  }
}

// Use real Upstash KV if available, otherwise use mock
export const kv = process.env.UPSTASH_REST_URL && process.env.UPSTASH_REST_TOKEN
  ? (() => {
      try {
        const { Redis } = require('@upstash/redis')
        return new Redis({
          url: process.env.UPSTASH_REST_URL,
          token: process.env.UPSTASH_REST_TOKEN,
        })
      } catch (error) {
        console.warn('Upstash Redis not available, using mock KV store')
        return new MockKV()
      }
    })()
  : new MockKV() 