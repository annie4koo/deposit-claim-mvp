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
      law,
    }

    const prompt = `
Draft a professional, formal demand letter for security deposit return under ${state} state law. Use proper business letter format with the following details:

TENANT INFORMATION:
- Name: ${tenantName}
- Email: ${tenantEmail}
- Former rental address: ${rentalAddress}
- Security deposit amount: $${depositAmount}
- Deposit paid on: ${depositDate}
- Move-out date: ${moveOutDate}

LANDLORD INFORMATION:
${landlordInfo}

LEGAL REQUIREMENTS:
- State: ${state}
- Applicable law: ${law.code}
- Statutory deadline: ${law.days} days

LETTER REQUIREMENTS:
1. Use formal business letter format with proper date, addresses, and salutation
2. Reference the specific state statute (${law.code})
3. Clearly state the ${law.days}-day deadline requirement
4. Demand return of the full security deposit amount ($${depositAmount})
5. Include tenant contact information (${tenantEmail})
6. Maintain professional, firm but respectful tone
7. Include a clear deadline for response (based on state law)
8. End with proper closing and signature line

Make the letter legally sound, professional, and appropriate for ${state} jurisdiction. The letter should be ready to print and mail.`

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
  law,
}: RequestBody & { law: { code: string; days: number | string } }) {
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

  return `${currentDate}

${landlordInfo}

RE: DEMAND FOR RETURN OF SECURITY DEPOSIT
Property Address: ${rentalAddress}
Tenant: ${tenantName}

Dear Landlord,

I am writing to formally demand the immediate return of my security deposit in the amount of $${depositAmount} for the above-referenced rental property.

FACTUAL BACKGROUND:
On ${depositDate}, I paid a security deposit of $${depositAmount} for the rental property located at ${rentalAddress}. I vacated the premises on ${moveOutDate}, leaving the property in good condition, normal wear and tear excepted.

LEGAL DEMAND:
Under ${state} state law, specifically ${law.code}, landlords are required to return security deposits within ${law.days} days of tenant move-out, unless there are legitimate deductions for damages beyond normal wear and tear or unpaid rent.

As of this date, ${law.days} days have passed since my move-out date, and I have not received my security deposit or any written explanation of deductions as required by law.

DEMAND FOR PAYMENT:
I hereby demand the immediate return of my full security deposit in the amount of $${depositAmount}. Failure to return this deposit may result in my pursuing all available legal remedies, including but not limited to:

1. Filing a lawsuit in small claims court
2. Seeking damages up to three times the deposit amount as provided by ${state} law
3. Recovery of attorney fees and court costs
4. Any other relief deemed proper by the court

DEADLINE FOR RESPONSE:
Please remit payment of $${depositAmount} within ten (10) days of receipt of this letter, no later than ${formattedDeadline}. Payment should be sent to my current address or via electronic transfer.

If you believe you have legitimate grounds for withholding any portion of the deposit, please provide a detailed written explanation with supporting documentation as required by ${law.code}.

I trust this matter can be resolved promptly without the need for legal action. However, I am prepared to pursue all available remedies to recover my deposit if necessary.

Please contact me at ${tenantEmail} to arrange return of my deposit or to discuss this matter further.

Sincerely,


${tenantName}
Email: ${tenantEmail}

cc: File Copy`
}
