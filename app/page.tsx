"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { LockIcon, FileTextIcon, BookIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

interface FormData {
  tenantName: string
  state: string
  rentalAddress: string
  depositAmount: string
  depositDate: string
  moveOutDate: string
  landlordInfo: string
  tenantEmail: string
}

interface FormErrors {
  [key: string]: string
}

export default function DepositClaimPage() {
  const [formData, setFormData] = useState<FormData>({
    tenantName: "",
    state: "",
    rentalAddress: "",
    depositAmount: "",
    depositDate: "",
    moveOutDate: "",
    landlordInfo: "",
    tenantEmail: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const [apiError, setApiError] = useState<string>("")

  // Date Selector Component - 使用下拉选择避免输入问题
  const DateSelector = ({ 
    id, 
    value, 
    onChange, 
    hasError 
  }: {
    id: string
    value: string
    onChange: (value: string) => void
    hasError?: boolean
  }) => {
    // 解析现有值
    const parseDate = (dateStr: string) => {
      if (!dateStr) return { month: '', day: '', year: '' }
      
      // 如果是MM/DD/YYYY格式
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        return {
          month: parts[0] || '',
          day: parts[1] || '',
          year: parts[2] || ''
        }
      }
      
      return { month: '', day: '', year: '' }
    }

    const { month, day, year } = parseDate(value)

    // 获取指定月份和年份的天数
    const getDaysInMonth = (month: number, year: number) => {
      if (!month || !year) return 31
      return new Date(year, month, 0).getDate()
    }

    const monthNum = parseInt(month) || 0
    const yearNum = parseInt(year) || new Date().getFullYear()
    const maxDays = getDaysInMonth(monthNum, yearNum)

    // 月份选项
    const months = [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ]

    // 年份选项（2020-2030）
    const years = Array.from({ length: 11 }, (_, i) => {
      const year = 2020 + i
      return { value: year.toString(), label: year.toString() }
    })

    // 日期选项
    const days = Array.from({ length: maxDays }, (_, i) => {
      const day = i + 1
      return { value: day.toString(), label: day.toString() }
    })

    const handleChange = (field: 'month' | 'day' | 'year', newValue: string) => {
      const current = parseDate(value)
      const updated = { ...current, [field]: newValue }
      
      // 如果所有字段都有值，组合成完整日期
      if (updated.month && updated.day && updated.year) {
        const formattedDate = `${updated.month.padStart(2, '0')}/${updated.day.padStart(2, '0')}/${updated.year}`
        onChange(formattedDate)
      } else {
        // 否则保存部分值
        const partialDate = `${updated.month}${updated.day ? '/' + updated.day : ''}${updated.year ? '/' + updated.year : ''}`
        onChange(partialDate)
      }
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Select value={month} onValueChange={(value) => handleChange('month', value)}>
              <SelectTrigger className={`${hasError ? 'border-red-500' : 'border-gray-300'} text-sm`}>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={day} onValueChange={(value) => handleChange('day', value)}>
              <SelectTrigger className={`${hasError ? 'border-red-500' : 'border-gray-300'} text-sm`}>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={year} onValueChange={(value) => handleChange('year', value)}>
              <SelectTrigger className={`${hasError ? 'border-red-500' : 'border-gray-300'} text-sm`}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Ensure date inputs use English locale
    const dateInputs = document.querySelectorAll('input[type="date"]')
    dateInputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement
      htmlInput.setAttribute('lang', 'en-US')
      // Force browser to use en-US locale for date formatting
      htmlInput.style.fontFeatureSettings = '"tnum"'
      
      // Try to force English locale through various methods
      htmlInput.setAttribute('data-locale', 'en-US')
      htmlInput.setAttribute('data-date-format', 'MM/DD/YYYY')
      
      // Force webkit browsers to use English
      if ('webkitAppearance' in htmlInput.style) {
        htmlInput.style.setProperty('-webkit-locale', '"en-US"')
      }
      
      // Add a custom placeholder effect
      if (!htmlInput.value) {
        htmlInput.style.color = '#9ca3af'
        const placeholder = document.createElement('div')
        placeholder.textContent = 'MM/DD/YYYY'
        placeholder.style.cssText = `
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          font-size: 14px;
          z-index: 1;
        `
        htmlInput.parentElement?.style.setProperty('position', 'relative')
        htmlInput.parentElement?.appendChild(placeholder)
        
        // Hide placeholder when input has value or is focused
        const handleInputChange = () => {
          if (htmlInput.value || htmlInput === document.activeElement) {
            placeholder.style.display = 'none'
            htmlInput.style.color = '#374151'
          } else {
            placeholder.style.display = 'block'
            htmlInput.style.color = '#9ca3af'
          }
        }
        
        htmlInput.addEventListener('input', handleInputChange)
        htmlInput.addEventListener('focus', handleInputChange)
        htmlInput.addEventListener('blur', handleInputChange)
      }
    })
    
    // Also try to set document language explicitly
    document.documentElement.lang = 'en-US'
    
    // Force reload of stylesheets to clear any cached locale styles
    const links = document.querySelectorAll('link[rel="stylesheet"]')
    links.forEach((link) => {
      const href = (link as HTMLLinkElement).href
      if (href.includes('/_next/static/css/')) {
        const newLink = document.createElement('link')
        newLink.rel = 'stylesheet'
        newLink.href = href + '?v=' + Date.now()
        document.head.appendChild(newLink)
        // Remove old link after new one loads
        newLink.onload = () => {
          if (link.parentNode) {
            link.parentNode.removeChild(link)
          }
        }
      }
    })
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Your name is required"
    }

    if (!formData.state) {
      newErrors.state = "State is required"
    }

    if (!formData.rentalAddress.trim()) {
      newErrors.rentalAddress = "Rental address is required"
    }

    if (!formData.depositAmount || Number.parseFloat(formData.depositAmount) <= 0) {
      newErrors.depositAmount = "Deposit amount must be greater than 0"
    }

    if (!formData.depositDate) {
      newErrors.depositDate = "Deposit payment date is required"
    }

    if (!formData.moveOutDate) {
      newErrors.moveOutDate = "Move-out date is required"
    }

    if (formData.depositDate && formData.moveOutDate) {
      const depositDate = new Date(formData.depositDate)
      const moveOutDate = new Date(formData.moveOutDate)
      if (moveOutDate < depositDate) {
        newErrors.moveOutDate = "Move-out date must be after deposit payment date"
      }
    }

    if (!formData.landlordInfo.trim()) {
      newErrors.landlordInfo = "Landlord name and address is required"
    }

    if (!formData.tenantEmail.trim()) {
      newErrors.tenantEmail = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.tenantEmail)) {
      newErrors.tenantEmail = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // 清除API错误当用户修改输入时
    if (apiError) {
      setApiError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setShowSuccess(false)
    setApiError("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorData = await response.json()
          if (errorData.details && Array.isArray(errorData.details)) {
            // 处理验证错误
            const newErrors: FormErrors = {}
            errorData.details.forEach((detail: any) => {
              if (detail.field) {
                newErrors[detail.field] = detail.message
              }
            })
            setErrors(newErrors)
            setApiError(`Form validation failed: ${errorData.error}`)
          } else {
            setApiError(errorData.error || "Letter generation failed, please try again")
          }
        } catch {
          // 如果无法解析JSON，显示通用错误
          setApiError(`Server error (${response.status}): Please try again later`)
        }
        return
      }

      const letterText = await response.text()
      setGeneratedLetter(letterText)
      setShowSuccess(true)
      setActiveTab("letter")

      // Auto-select the generated text for easy copying
      setTimeout(() => {
        const textarea = document.getElementById("letter") as HTMLTextAreaElement
        if (textarea) {
          textarea.select()
        }
      }, 100)
    } catch (error) {
      console.error("Request failed:", error)
      setApiError("Network error, please check connection and try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Get Your Security Deposit Back</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate a professional legal demand letter based on your state's laws to help recover your security deposit
            from your landlord.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="h-14 w-full bg-white rounded-none border-b border-gray-200 px-6">
                <TabsTrigger
                  value="form"
                  className="data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none border-b-2 border-transparent px-4"
                >
                  Form
                </TabsTrigger>
                <TabsTrigger
                  value="letter"
                  className="data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none border-b-2 border-transparent px-4"
                >
                  Generated Letter
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="form" className="p-6">
              {apiError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-800 font-medium">Error</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setApiError("")}
                      className="text-red-500 hover:text-red-700 text-xl leading-none"
                      aria-label="Close error message"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-red-700 mt-1">{apiError}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tenantName" className="text-gray-700">
                      Your Full Name *
                    </Label>
                    <Input
                      id="tenantName"
                      value={formData.tenantName}
                      onChange={(e) => handleInputChange("tenantName", e.target.value)}
                      className={`mt-1 ${errors.tenantName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter your full legal name"
                    />
                    {errors.tenantName && <p className="text-sm text-red-600 mt-1">{errors.tenantName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-gray-700">
                      State *
                    </Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger className={`mt-1 ${errors.state ? "border-red-500" : "border-gray-300"}`}>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="depositAmount" className="text-gray-700">
                      Security Deposit Amount (USD) *
                    </Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.depositAmount}
                      onChange={(e) => handleInputChange("depositAmount", e.target.value)}
                      className={`mt-1 ${errors.depositAmount ? "border-red-500" : "border-gray-300"}`}
                      placeholder="1500.00"
                    />
                    {errors.depositAmount && <p className="text-sm text-red-600 mt-1">{errors.depositAmount}</p>}
                  </div>

                  <div>
                    <Label htmlFor="depositDate" className="text-gray-700">
                      Deposit Payment Date *
                    </Label>
                    <DateSelector
                      id="depositDate"
                      value={formData.depositDate}
                      onChange={(value) => handleInputChange("depositDate", value)}
                      hasError={!!errors.depositDate}
                    />
                    {errors.depositDate && <p className="text-sm text-red-600 mt-1">{errors.depositDate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="moveOutDate" className="text-gray-700">
                      Move-Out Date *
                    </Label>
                    <DateSelector
                      id="moveOutDate"
                      value={formData.moveOutDate}
                      onChange={(value) => handleInputChange("moveOutDate", value)}
                      hasError={!!errors.moveOutDate}
                    />
                    {errors.moveOutDate && <p className="text-sm text-red-600 mt-1">{errors.moveOutDate}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rentalAddress" className="text-gray-700">
                    Rental Property Address *
                  </Label>
                  <Textarea
                    id="rentalAddress"
                    value={formData.rentalAddress}
                    onChange={(e) => handleInputChange("rentalAddress", e.target.value)}
                    className={`mt-1 ${errors.rentalAddress ? "border-red-500" : "border-gray-300"}`}
                    placeholder="123 Main St, City, State, ZIP"
                    rows={4}
                  />
                  {errors.rentalAddress && <p className="text-sm text-red-600 mt-1">{errors.rentalAddress}</p>}
                </div>

                <div>
                  <Label htmlFor="landlordInfo" className="text-gray-700">
                    Landlord Name and Address *
                  </Label>
                  <Textarea
                    id="landlordInfo"
                    value={formData.landlordInfo}
                    onChange={(e) => handleInputChange("landlordInfo", e.target.value)}
                    className={`mt-1 ${errors.landlordInfo ? "border-red-500" : "border-gray-300"}`}
                    placeholder="John Smith&#10;ABC Property Management&#10;456 Business Ave&#10;City, State, ZIP"
                    rows={4}
                  />
                  {errors.landlordInfo && <p className="text-sm text-red-600 mt-1">{errors.landlordInfo}</p>}
                </div>

                <div>
                  <Label htmlFor="tenantEmail" className="text-gray-700">
                    Your Email Address *
                  </Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    value={formData.tenantEmail}
                    onChange={(e) => handleInputChange("tenantEmail", e.target.value)}
                    className={`mt-1 ${errors.tenantEmail ? "border-red-500" : "border-gray-300"}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.tenantEmail && <p className="text-sm text-red-600 mt-1">{errors.tenantEmail}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating Letter..." : "Generate Legal Demand Letter"}
                </Button>
              </form>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <LockIcon className="h-5 w-5 text-teal-600 mt-0.5" />
                    <p className="text-gray-600">Your information is processed securely and not stored</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileTextIcon className="h-5 w-5 text-teal-600 mt-0.5" />
                    <p className="text-gray-600">Generated letter is automatically formatted and ready to copy</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookIcon className="h-5 w-5 text-teal-600 mt-0.5" />
                    <p className="text-gray-600">Based on state-specific legal requirements</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="letter" className="p-6">
              {generatedLetter ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                    <p className="text-green-800 text-sm">
                      Your letter has been generated successfully. The text is automatically selected for easy copying.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Generated Letter</span>
                      <button
                        onClick={() => {
                          const textarea = document.getElementById("letter") as HTMLTextAreaElement
                          if (textarea) {
                            textarea.select()
                            document.execCommand("copy")
                          }
                        }}
                        className="text-sm text-teal-600 hover:text-teal-700"
                      >
                        Copy to clipboard
                      </button>
                    </div>
                    <Textarea
                      id="letter"
                      value={generatedLetter}
                      readOnly
                      rows={20}
                      className="font-mono text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50"
                      onClick={() => setActiveTab("form")}
                    >
                      Back to Form
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Letter Generated Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Fill out the form and click "Generate Legal Demand Letter" to create your letter.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    onClick={() => setActiveTab("form")}
                  >
                    Go to Form
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 DepositRecovery. This tool is for educational purposes only and is not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

