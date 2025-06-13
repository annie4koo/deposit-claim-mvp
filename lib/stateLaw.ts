// 计算business days的函数
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate)
  let addedDays = 0
  
  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1)
    // 跳过周末 (0=Sunday, 6=Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }
  
  return result
}

// 计算法定截止日期
export function calculateStatutoryDeadline(state: string, moveOutDate: string): string {
  const law = stateLaw[state as StateCode]
  if (!law || !moveOutDate) return 'See letter for details'
  
  try {
    const [month, day, year] = moveOutDate.split('/')
    const moveOut = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    let deadline: Date
    if (law.daysType === 'business') {
      deadline = addBusinessDays(moveOut, law.days)
    } else {
      deadline = new Date(moveOut)
      deadline.setDate(deadline.getDate() + law.days)
    }
    
    const formattedDeadline = deadline.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
    
    const daysType = law.daysType === 'business' ? 'business days' : 'calendar days'
    return `${formattedDeadline} (${law.days} ${daysType})`
  } catch {
    return 'See letter for details'
  }
}

export const stateLaw = {
  CA: { code: "Cal. Civ. Code §1950.5", days: 21, daysType: "calendar", penaltyMultiplier: 2 },
  NY: { code: "N.Y. Gen. Oblig. §7-103", days: 14, daysType: "calendar", penaltyMultiplier: 2 },
  TX: { code: "Tex. Prop. Code §92.109", days: 30, daysType: "calendar", penaltyMultiplier: 3 },
  FL: { code: "Fla. Stat. §83.49", days: 15, daysType: "calendar", penaltyMultiplier: 2 },
  IL: { code: "765 ILCS 710/1", days: 45, daysType: "calendar", penaltyMultiplier: 2 },
  PA: { code: "68 Pa. Cons. Stat. §250.512", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  OH: { code: "Ohio Rev. Code §5321.16", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  GA: { code: "O.C.G.A. §44-7-55", days: 30, daysType: "calendar", penaltyMultiplier: 3 },
  NC: { code: "N.C. Gen. Stat. §42-52", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  MI: { code: "Mich. Comp. Laws §554.613", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  NJ: { code: "N.J. Stat. Ann. §46:8-21.1", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  VA: { code: "Va. Code Ann. §55.1-1226", days: 45, daysType: "calendar", penaltyMultiplier: 2 },
  WA: { code: "RCW 59.18.280", days: 21, daysType: "calendar", penaltyMultiplier: 2 },
  AZ: { code: "A.R.S. §33-1321", days: 14, daysType: "business", penaltyMultiplier: 2 },
  MA: { code: "Mass. Gen. Laws ch. 186, §15B", days: 30, daysType: "calendar", penaltyMultiplier: 3 },
  TN: { code: "Tenn. Code Ann. §66-28-301", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  IN: { code: "Ind. Code §32-31-3-12", days: 45, daysType: "calendar", penaltyMultiplier: 2 },
  MO: { code: "Mo. Rev. Stat. §535.300", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  MD: { code: "Md. Code Ann., Real Prop. §8-203", days: 45, daysType: "calendar", penaltyMultiplier: 3 },
  WI: { code: "Wis. Stat. §704.28", days: 21, daysType: "calendar", penaltyMultiplier: 2 },
  CO: { code: "C.R.S. §38-12-103", days: 60, daysType: "calendar", penaltyMultiplier: 3 },
  MN: { code: "Minn. Stat. §504B.178", days: 21, daysType: "calendar", penaltyMultiplier: 2 },
  SC: { code: "S.C. Code Ann. §27-40-410", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  AL: { code: "Ala. Code §35-9A-201", days: 60, daysType: "calendar", penaltyMultiplier: 2 },
  LA: { code: "La. Civ. Code art. 2707", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  KY: { code: "KRS §383.580", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  OR: { code: "ORS 90.300", days: 31, daysType: "calendar", penaltyMultiplier: 2 },
  OK: { code: "41 Okla. Stat. §115", days: 45, daysType: "calendar", penaltyMultiplier: 2 },
  CT: { code: "Conn. Gen. Stat. §47a-21", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  UT: { code: "Utah Code §57-17-3", days: 30, daysType: "calendar", penaltyMultiplier: 3 },
  NV: { code: "Nev. Rev. Stat. §118A.242", days: 30, daysType: "calendar", penaltyMultiplier: 3 },
  AR: { code: "Ark. Code Ann. §18-16-305", days: 60, daysType: "calendar", penaltyMultiplier: 2 },
  MS: { code: "Miss. Code Ann. §89-8-21", days: 45, daysType: "calendar", penaltyMultiplier: 2 },
  KS: { code: "K.S.A. §58-2550", days: 30, daysType: "calendar", penaltyMultiplier: 1.5 },
  NM: { code: "N.M. Stat. Ann. §47-8-18", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  NE: { code: "Neb. Rev. Stat. §76-1416", days: 14, daysType: "calendar", penaltyMultiplier: 2 },
  WV: { code: "W. Va. Code §37-6A-1", days: 60, daysType: "calendar", penaltyMultiplier: 2 },
  ID: { code: "Idaho Code §6-321", days: 21, daysType: "calendar", penaltyMultiplier: 3 },
  HI: { code: "Haw. Rev. Stat. §521-44", days: 14, daysType: "calendar", penaltyMultiplier: 2 },
  NH: { code: "N.H. Rev. Stat. Ann. §540-A:7", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  ME: { code: "14 M.R.S. §6033", days: 21, daysType: "calendar", penaltyMultiplier: 2 },
  RI: { code: "R.I. Gen. Laws §34-18-19", days: 20, daysType: "calendar", penaltyMultiplier: 2 },
  MT: { code: "Mont. Code Ann. §70-25-201", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  DE: { code: "25 Del. Code §5514", days: 20, daysType: "calendar", penaltyMultiplier: 2 },
  SD: { code: "S.D. Codified Laws §43-32-24", days: 45, daysType: "calendar", penaltyMultiplier: 2 },
  ND: { code: "N.D. Cent. Code §47-16-07.1", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
  AK: { code: "Alaska Stat. §34.03.070", days: 14, daysType: "calendar", penaltyMultiplier: 1.5 },
  VT: { code: "9 V.S.A. §4461", days: 14, daysType: "calendar", penaltyMultiplier: 2 },
  WY: { code: "Wyo. Stat. Ann. §1-21-1208", days: 30, daysType: "calendar", penaltyMultiplier: 2 },
} as const

export type StateCode = keyof typeof stateLaw

// Function to calculate business days
export function calculateBusinessDays(startDate: Date, days: number): Date {
  let currentDate = new Date(startDate)
  let remainingDays = days

  while (remainingDays > 0) {
    currentDate.setDate(currentDate.getDate() + 1)
    // Skip weekends (0=Sunday, 6=Saturday)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      remainingDays--
    }
  }

  return currentDate
}

// Get statutory days for a state
export function getStatutoryDays(state: string): number {
  const law = stateLaw[state as StateCode]
  return law ? law.days : 14 // Default to 14 days if state not found
}

// Calculate statutory deadline
export function calculateDeadline(moveOutDate: string, state: string): Date {
  const baseDate = new Date(moveOutDate)
  const days = getStatutoryDays(state)
  return calculateBusinessDays(baseDate, days)
}
