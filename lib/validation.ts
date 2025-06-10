import { z } from "zod"

// 表单数据验证模式
export const depositClaimSchema = z.object({
  tenantName: z.string()
    .min(1, "Your name is required")
    .min(2, "Name must be at least 2 characters"),
  
  state: z.string()
    .min(1, "State is required"),
  
  rentalAddress: z.string()
    .min(1, "Rental address is required")
    .min(10, "Please enter a complete address"),
  
  depositAmount: z.string()
    .min(1, "Deposit amount is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Deposit amount must be greater than 0"),
  
  depositDate: z.string()
    .min(1, "Deposit payment date is required")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format"),
  
  moveOutDate: z.string()
    .min(1, "Move-out date is required")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in MM/DD/YYYY format"),
  
  landlordInfo: z.string()
    .min(1, "Landlord information is required")
    .min(10, "Please provide complete landlord name and address"),
  
  tenantEmail: z.string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  
  forwardingAddress: z.string()
    .min(1, "Current address is required for legal compliance")
    .min(10, "Please provide a complete forwarding address"),
}).refine((data) => {
  // 验证日期顺序：moveOutDate 必须 >= depositDate
  const depositDate = parseDate(data.depositDate)
  const moveOutDate = parseDate(data.moveOutDate)
  
  if (!depositDate || !moveOutDate) {
    return false // 日期格式无效
  }
  
  return moveOutDate >= depositDate
}, {
  message: "Move-out date must be on or after deposit payment date",
  path: ["moveOutDate"]
})

// 日期解析辅助函数
function parseDate(dateStr: string): Date | null {
  const [month, day, year] = dateStr.split('/')
  if (!month || !day || !year) return null
  
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  
  // 验证日期是否有效
  if (isNaN(date.getTime())) return null
  if (date.getFullYear() != parseInt(year)) return null
  if (date.getMonth() != parseInt(month) - 1) return null
  if (date.getDate() != parseInt(day)) return null
  
  return date
}

export function validateDateOrder(data: { depositDate: string; moveOutDate: string }) {
  const depositDate = parseDate(data.depositDate)
  const moveOutDate = parseDate(data.moveOutDate)
  
  if (!depositDate) {
    return { success: false, error: "Invalid deposit date format. Please use MM/DD/YYYY." }
  }
  
  if (!moveOutDate) {
    return { success: false, error: "Invalid move-out date format. Please use MM/DD/YYYY." }
  }
  
  if (moveOutDate < depositDate) {
    return { success: false, error: "Move-out date cannot be before deposit payment date." }
  }
  
  return { success: true }
}

export type DepositClaimData = z.infer<typeof depositClaimSchema> 