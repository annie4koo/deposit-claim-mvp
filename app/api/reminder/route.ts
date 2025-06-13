import { NextResponse } from "next/server"
import { kv, type ClaimData } from "@/lib/upstash"

export async function GET() {
  try {
    console.log("🔄 Starting reminder check...")
    
    // Scan for all claims
    const [, claimKeys] = await kv.scan(0, "claim:*")
    console.log(`📊 Found ${claimKeys.length} claims to check`)
    
    let remindersSent = 0
    let cleanedUp = 0
    
    for (const key of claimKeys) {
      const claim: ClaimData = await kv.get(key)
      if (!claim) continue
      
      const now = new Date()
      const deadline = new Date(claim.deadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // T-3 day reminder
      if (daysUntilDeadline === 3 && claim.reminderOptIn) {
        // Send T-3 reminder
        console.log(`📧 [TEST MODE] T-3 reminder for claim ${claim.id}`)
        remindersSent++
      }
      
      // T+2 day reminder (deadline passed)
      if (daysUntilDeadline === -2 && claim.reminderOptIn) {
        // Send T+2 reminder
        console.log(`📧 [TEST MODE] T+2 reminder for claim ${claim.id}`)
        remindersSent++
      }
      
      // Clean up claims older than 30 days past deadline
      if (daysUntilDeadline < -30) {
        await kv.del(key)
        cleanedUp++
      }
    }
    
    const result = {
      success: true,
      claimsChecked: claimKeys.length,
      remindersSent,
      cleanedUp,
      timestamp: new Date().toISOString()
    }
    
    console.log("✅ Reminder check completed:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Reminder check error:', error)
    return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 })
  }
} 