import { z } from "zod"

// 表单数据验证模式
export const depositClaimSchema = z.object({
  tenantName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  state: z.string().length(2, "Please select a valid state"),
  rentalAddress: z.string().min(10, "Please enter complete rental address").max(200, "Address cannot exceed 200 characters"),
  depositAmount: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num <= 100000
  }, "Deposit amount must be a valid number between 0 and 100,000"),
  depositDate: z.string().refine((date) => {
    const dateObj = new Date(date)
    const now = new Date()
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
    return dateObj >= fiveYearsAgo && dateObj <= now
  }, "Deposit payment date should be within the past five years"),
  moveOutDate: z.string().refine((date) => {
    const dateObj = new Date(date)
    const now = new Date()
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
    return dateObj >= fiveYearsAgo && dateObj <= now
  }, "Move-out date should be within the past five years"),
  landlordInfo: z.string().min(15, "Please provide complete landlord name and address").max(500, "Landlord information cannot exceed 500 characters"),
  tenantEmail: z.string().email("Please enter a valid email address")
})

// 交叉验证：搬出日期应晚于押金支付日期
export const validateDateOrder = (data: any) => {
  const depositDate = new Date(data.depositDate)
  const moveOutDate = new Date(data.moveOutDate)
  
  if (moveOutDate <= depositDate) {
    return {
      success: false,
      error: "Move-out date must be after deposit payment date"
    }
  }
  return { success: true }
}

export type DepositClaimData = z.infer<typeof depositClaimSchema> 