import { type NextRequest, NextResponse } from "next/server"
import { stateLaw } from "@/lib/stateLaw"
import { depositClaimSchema, validateDateOrder } from "@/lib/validation"
import { selectAppropriateTemplate } from "@/lib/letterTemplates"

export const runtime = "edge"

interface RequestBody {
  tenantName: string
  state: string
  rentalAddress: string
  depositAmount: string
  depositDate: string
  moveOutDate: string
  landlordInfo: string
  tenantEmail: string
  forwardingAddress: string
  templateType?: 'standard' | 'firm' | 'friendly'
}

export async function POST(req: NextRequest) {
  try {
    const requestData: RequestBody = await req.json()

    // 数据验证
    const validationResult = depositClaimSchema.safeParse(requestData)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Input data validation failed", 
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }, 
        { status: 400 }
      )
    }

    // 日期交叉验证
    const dateValidation = validateDateOrder(requestData)
    if (!dateValidation.success) {
      return NextResponse.json(
        { error: dateValidation.error }, 
        { status: 400 }
      )
    }

    const {
      tenantName,
      state,
      rentalAddress,
      depositAmount,
      depositDate,
      moveOutDate,
      landlordInfo,
      tenantEmail,
      forwardingAddress,
      templateType,
    } = requestData

    const law = stateLaw[state as keyof typeof stateLaw] ?? {
      code: "applicable state statute",
      days: "the statutory",
    }

    const letterData = {
      tenantName,
      state,
      rentalAddress,
      depositAmount,
      depositDate,
      moveOutDate,
      landlordInfo,
      tenantEmail,
      forwardingAddress,
      law,
    }

    const prompt = `
Draft a professional, formal demand letter for security deposit return under ${state} state law. Follow this exact structure and format:

TENANT INFORMATION:
- Name: ${tenantName}
- Email: ${tenantEmail}
- Current address: ${forwardingAddress}
- Former rental address: ${rentalAddress}
- Security deposit amount: $${depositAmount}
- Deposit paid on: ${depositDate}
- Move-out date: ${moveOutDate}

LANDLORD INFORMATION:
${landlordInfo}

LEGAL REQUIREMENTS:
- State: ${state}
- Applicable law: ${law.code}
- Statutory deadline: ${law.days} ${law.daysType === 'business' ? 'business days' : 'calendar days'}
- Penalty multiplier: ${law.penaltyMultiplier || 3}x

REQUIRED LETTER FORMAT:
1. Start with tenant's actual forwarding address:
${forwardingAddress}

2. Add "Sent via Certified Mail, Return Receipt Requested"

3. Current date

4. Landlord name and address

5. "Re: Demand for Return of Security Deposit" with:
   - Rental Property: [address]
   - Amount in Dispute: $[amount with .00]

6. "Dear Landlord,"

7. FACTUAL BACKGROUND section stating deposit payment, move-out date, and condition

8. LEGAL DEMAND section with:
   - Specific state statute reference (${law.code})
   - ${law.days} ${law.daysType === 'business' ? 'business days' : 'calendar days'} requirement
   - Consequences for non-compliance

9. DEMAND FOR PAYMENT section with:
   - 10 calendar days deadline
   - Payment options (check to forwarding address or electronic transfer)

10. CONSEQUENCES OF NON-COMPLIANCE section with bullet points:
    - Filing suit in small-claims court
    - Seeking damages up to ${law.penaltyMultiplier || 3} times the deposit amount ($${(parseFloat(depositAmount) * (law.penaltyMultiplier || 3)).toFixed(2)})
    - Recovering court costs and attorney fees
    - Additional relief

11. DOCUMENTATION section about itemization requirements

12. Closing paragraphs about amicable resolution and contact information

13. "Sincerely," with signature space and tenant name

14. Add footer: "Sent via Certified Mail No. _____ (Return Receipt Requested)"

Format the deposit amount as $${parseFloat(depositAmount).toFixed(2)}. Use accurate ${state} law details: ${law.days} ${law.daysType === 'business' ? 'business days' : 'calendar days'} and ${law.penaltyMultiplier || 3}x penalty multiplier. Make the letter legally sound and appropriate for ${state} jurisdiction.`

    // Option 1: Use OpenAI API (uncomment and add your API key)
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a legal assistant specializing in tenant-landlord law. Generate professional, legally accurate demand letters for security deposit return.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedLetter = data.choices[0].message.content;
          
          return new Response(generatedLetter, {
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }
      } catch (error) {
        console.error("OpenAI API error:", error);
        // Fall back to template if OpenAI fails
      }
    }

    // Option 2: Use Anthropic Claude API (alternative)
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: `You are a legal assistant specializing in tenant-landlord law. Generate a professional, legally accurate demand letter for security deposit return.\n\n${prompt}`
              }
            ]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedLetter = data.content[0].text;
          
          return new Response(generatedLetter, {
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }
      } catch (error) {
        console.error("Anthropic API error:", error);
        // Fall back to template if Anthropic fails
      }
    }

    // Fallback: Use enhanced template system
    const generatedLetter = selectAppropriateTemplate(letterData, templateType)

    return new Response(generatedLetter, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error generating letter:", error)
    return NextResponse.json({ error: "Failed to generate letter" }, { status: 500 })
  }
}

function generateMockLetter({
  tenantName,
  state,
  rentalAddress,
  depositAmount,
  depositDate,
  moveOutDate,
  landlordInfo,
  tenantEmail,
  forwardingAddress,
  law,
}: RequestBody & { law: { code: string; days: number | string; daysType?: string; penaltyMultiplier?: number } }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const deadlineDate = new Date()
  deadlineDate.setDate(deadlineDate.getDate() + 10)
  const formattedDeadline = deadlineDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // 计算法定截止日期
  const moveOut = new Date(moveOutDate)
  const statutoryDeadline = new Date(moveOut)
  const daysNum = typeof law.days === 'string' ? 14 : law.days
  statutoryDeadline.setDate(statutoryDeadline.getDate() + daysNum)
  const formattedStatutoryDeadline = statutoryDeadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedAmount = parseFloat(depositAmount).toFixed(2)
  const penaltyMultiplier = law.penaltyMultiplier || 3
  const penaltyAmount = (parseFloat(depositAmount) * penaltyMultiplier).toFixed(2)
  const daysType = law.daysType === 'business' ? 'business days' : 'calendar days'
  const dayLabel = typeof law.days === 'number' && law.days === 1 ? 
    (law.daysType === 'business' ? 'business day' : 'calendar day') : daysType

  return `${forwardingAddress}

Sent via Certified Mail, Return Receipt Requested

${currentDate}

${landlordInfo}

Re: Demand for Return of Security Deposit
Rental Property: ${rentalAddress}
Amount in Dispute: $${formattedAmount}

Dear Landlord,

FACTUAL BACKGROUND
On ${depositDate}, I paid a security deposit of $${formattedAmount} for the above-referenced property. I returned possession—including keys—on ${moveOutDate}. The premises were left in good condition, normal wear and tear excepted.

LEGAL DEMAND
Under ${state} state law, specifically ${law.code}, a landlord must refund the full security deposit, or provide a written, itemized statement of lawful deductions, within ${law.days} ${dayLabel} after the tenant delivers possession. Failure to comply may entitle a tenant to recover damages, court costs and reasonable attorney fees.

As of today, the statutory deadline of ${formattedStatutoryDeadline} has passed. I have received neither payment nor any written explanation of deductions.

DEMAND FOR PAYMENT
Please remit the full deposit of $${formattedAmount} no later than ${formattedDeadline} (10 calendar days from receipt of this letter). Payment options:

• Check mailed to my forwarding address above, or
• Electronic transfer (ACH/Zelle); email me to obtain routing details.

CONSEQUENCES OF NON-COMPLIANCE
If you fail to comply by the stated deadline, I will immediately pursue all remedies available, including:

• Filing suit in small-claims court;
• Seeking damages up to ${penaltyMultiplier} times the deposit amount ($${penaltyAmount}) as provided by ${state} law;
• Recovering court costs and attorney fees; and
• Any additional relief the court deems appropriate.

DOCUMENTATION
Should you contend that any portion of the deposit is lawfully withheld, you must—by the same deadline—provide a detailed, written itemization of each deduction with supporting documentation, as expressly required by ${law.code}.

I prefer to resolve this matter amicably. Your prompt attention will avoid unnecessary legal action.

Please confirm receipt and advise of your payment method at ${tenantEmail}.

Thank you for your immediate cooperation.

Sincerely,



${tenantName}

Sent via Certified Mail No. _____ (Return Receipt Requested)`
}
