import { NextResponse } from "next/server"
import { kv, type ClaimData } from "@/lib/upstash"
import { calculateDeadline } from "@/lib/stateLaw"

export async function POST(request: Request) {
  try {
    const { tenantName, tenantEmail, landlordEmail, amount, state, moveOutDate } = await request.json()

    // Generate unique claim ID
    const claimId = `claim:${crypto.randomUUID()}`
    
    // Calculate deadline based on state law
    const deadline = calculateDeadline(moveOutDate, state)

    // Create claim data
    const claimData: ClaimData = {
      id: claimId,
      tenantName,
      tenantEmail,
      landlordEmail,
      amount: amount.toString(),
      state,
      deadline: deadline.toISOString(),
      createdAt: Date.now(),
      reminderOptIn: true,
    }

    // Store in KV
    await kv.set(claimId, claimData)
    console.log(`📦 Stored claim for reminders: ${claimId}`)

    return NextResponse.json({ 
      success: true, 
      claimId,
      deadline: deadline.toISOString() 
    })
  } catch (error) {
    console.error('Setup reminders error:', error)
    return NextResponse.json({ error: 'Failed to setup reminders' }, { status: 500 })
  }
} 