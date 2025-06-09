interface LetterData {
  tenantName: string
  state: string
  rentalAddress: string
  depositAmount: string
  depositDate: string
  moveOutDate: string
  landlordInfo: string
  tenantEmail: string
  law: { code: string; days: number | string }
}

// 计算法定期限是否已过
export function isDeadlinePassed(moveOutDate: string, days: number | string): boolean {
  const moveOut = new Date(moveOutDate)
  const deadline = new Date(moveOut)
  const daysNum = typeof days === 'string' ? 30 : days // 默认30天
  deadline.setDate(deadline.getDate() + daysNum)
  
  return new Date() > deadline
}

// 计算剩余天数或过期天数
export function getDaysInfo(moveOutDate: string, days: number | string): { 
  isPastDue: boolean
  daysCount: number
  description: string
} {
  const moveOut = new Date(moveOutDate)
  const deadline = new Date(moveOut)
  const daysNum = typeof days === 'string' ? 30 : days
  deadline.setDate(deadline.getDate() + daysNum)
  
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return {
      isPastDue: true,
      daysCount: Math.abs(diffDays),
      description: `已超过法定期限${Math.abs(diffDays)}天`
    }
  } else {
    return {
      isPastDue: false,
      daysCount: diffDays,
      description: `距离法定期限还有${diffDays}天`
    }
  }
}

// 标准催讨信函模板
export function generateStandardTemplate(data: LetterData): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const responseDeadline = new Date()
  responseDeadline.setDate(responseDeadline.getDate() + 10)
  const formattedDeadline = responseDeadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const daysInfo = getDaysInfo(data.moveOutDate, data.law.days)

  return `${currentDate}

${data.landlordInfo}

RE: DEMAND FOR RETURN OF SECURITY DEPOSIT
Property Address: ${data.rentalAddress}
Tenant: ${data.tenantName}

Dear Landlord,

I am writing to formally demand the immediate return of my security deposit in the amount of $${data.depositAmount} for the above-referenced rental property.

FACTUAL BACKGROUND:
On ${data.depositDate}, I paid a security deposit of $${data.depositAmount} for the rental property located at ${data.rentalAddress}. I vacated the premises on ${data.moveOutDate}, leaving the property in good condition, normal wear and tear excepted.

LEGAL DEMAND:
Under ${data.state} state law, specifically ${data.law.code}, landlords are required to return security deposits within ${data.law.days} days of tenant move-out, unless there are legitimate deductions for damages beyond normal wear and tear or unpaid rent.

${daysInfo.isPastDue 
  ? `The statutory deadline has passed ${daysInfo.daysCount} days ago. You are now in violation of state law.`
  : `${daysInfo.description}.`
}

DEMAND FOR PAYMENT:
I hereby demand the immediate return of my full security deposit in the amount of $${data.depositAmount}. Failure to return this deposit may result in my pursuing all available legal remedies, including but not limited to:

1. Filing a lawsuit in small claims court
2. Seeking damages up to three times the deposit amount as provided by ${data.state} law
3. Recovery of attorney fees and court costs
4. Any other relief deemed proper by the court

DEADLINE FOR RESPONSE:
Please remit payment of $${data.depositAmount} within ten (10) days of receipt of this letter, no later than ${formattedDeadline}. Payment should be sent to my current address or via electronic transfer.

If you believe you have legitimate grounds for withholding any portion of the deposit, please provide a detailed written explanation with supporting documentation as required by ${data.law.code}.

I trust this matter can be resolved promptly without the need for legal action. However, I am prepared to pursue all available remedies to recover my deposit if necessary.

Please contact me at ${data.tenantEmail} to arrange return of my deposit or to discuss this matter further.

Sincerely,


${data.tenantName}
Email: ${data.tenantEmail}

cc: File Copy`
}

// 强硬语气模板（用于超期情况）
export function generateFirmTemplate(data: LetterData): string {
  const daysInfo = getDaysInfo(data.moveOutDate, data.law.days)
  
  if (!daysInfo.isPastDue) {
    return generateStandardTemplate(data) // 如果未超期，使用标准模板
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `${currentDate}

${data.landlordInfo}

FINAL DEMAND FOR RETURN OF SECURITY DEPOSIT
Property Address: ${data.rentalAddress}
Tenant: ${data.tenantName}

Dear Landlord,

This letter serves as a FINAL DEMAND for the immediate return of my security deposit in the amount of $${data.depositAmount}.

VIOLATION OF STATE LAW:
You are currently in violation of ${data.state} state law (${data.law.code}). The statutory deadline for returning security deposits expired ${daysInfo.daysCount} days ago on the date that was ${data.law.days} days after my move-out date of ${data.moveOutDate}.

LEGAL CONSEQUENCES:
Your failure to comply with state law subjects you to significant penalties, including:
- Liability for damages up to THREE TIMES the deposit amount ($${(parseFloat(data.depositAmount) * 3).toFixed(2)})
- Responsibility for my attorney fees and court costs
- Potential additional damages as determined by the court

FINAL OPPORTUNITY:
This is your final opportunity to resolve this matter without legal action. You have FIVE (5) BUSINESS DAYS from receipt of this letter to:
1. Return the full deposit amount of $${data.depositAmount}, OR
2. Provide detailed written justification with supporting documentation for any deductions

LEGAL ACTION WARNING:
If you fail to respond appropriately within five business days, I will immediately file a lawsuit in small claims court seeking:
- Return of the full deposit amount ($${data.depositAmount})
- Treble damages ($${(parseFloat(data.depositAmount) * 3).toFixed(2)})
- Court costs and attorney fees
- Any other relief the court deems appropriate

Contact me immediately at ${data.tenantEmail} to arrange return of my deposit.

Sincerely,

${data.tenantName}
Email: ${data.tenantEmail}

cc: File Copy - Legal Action Pending`
}

// 友好语气模板（用于初次联系）
export function generateFriendlyTemplate(data: LetterData): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `${currentDate}

${data.landlordInfo}

RE: Request for Return of Security Deposit
Property Address: ${data.rentalAddress}
Former Tenant: ${data.tenantName}

Dear Landlord,

I hope this letter finds you well. I am writing to request the return of my security deposit for the rental property listed above.

RENTAL DETAILS:
I was a tenant at ${data.rentalAddress} and paid a security deposit of $${data.depositAmount} on ${data.depositDate}. I moved out on ${data.moveOutDate} and left the property in good condition, with only normal wear and tear.

LEGAL REQUIREMENT:
According to ${data.state} state law (${data.law.code}), security deposits must be returned within ${data.law.days} days of tenant move-out, unless there are legitimate deductions for damages beyond normal wear and tear.

REQUEST:
I would appreciate the return of my full security deposit of $${data.depositAmount}. If you believe any deductions are necessary, please provide me with a detailed written explanation and supporting documentation as required by law.

I trust we can resolve this matter amicably. Please feel free to contact me at ${data.tenantEmail} if you have any questions or need additional information.

Thank you for your prompt attention to this matter.

Best regards,

${data.tenantName}
Email: ${data.tenantEmail}`
}

// 根据情况选择合适的模板
export function selectAppropriateTemplate(data: LetterData, templateType?: 'standard' | 'firm' | 'friendly'): string {
  if (templateType) {
    switch (templateType) {
      case 'firm': return generateFirmTemplate(data)
      case 'friendly': return generateFriendlyTemplate(data)
      default: return generateStandardTemplate(data)
    }
  }

  // 自动选择模板
  const daysInfo = getDaysInfo(data.moveOutDate, data.law.days)
  
  if (daysInfo.isPastDue && daysInfo.daysCount > 30) {
    return generateFirmTemplate(data) // 超期30天以上用强硬语气
  } else if (daysInfo.isPastDue) {
    return generateStandardTemplate(data) // 刚超期用标准语气
  } else {
    return generateFriendlyTemplate(data) // 未超期用友好语气
  }
} 