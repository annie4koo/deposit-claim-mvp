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
import { stateLaw } from "@/lib/stateLaw"

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
  forwardingAddress: string
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
    forwardingAddress: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const [apiError, setApiError] = useState<string>("")
  const [copySuccess, setCopySuccess] = useState(false)

  // Simple event tracking function (ready for GA/PostHog integration)
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Console log for now - can be replaced with actual analytics
    console.log('Event:', eventName, properties)
    
    // Ready for Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties)
    }
    
    // Ready for PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(eventName, properties)
    }
  }

  // Calculate statutory deadline for display
  const calculateStatutoryDeadline = (state: string, moveOutDate: string) => {
    const law = (stateLaw as any)[state]
    if (!law || !moveOutDate) return 'See letter for details'
    
    try {
      const [month, day, year] = moveOutDate.split('/')
      const moveOut = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const deadline = new Date(moveOut)
      const daysNum = typeof law.days === 'string' ? 14 : law.days
      deadline.setDate(deadline.getDate() + daysNum)
      
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

  // Native-style Date Picker Component - 原生风格的下拉日期选择器
  const NativeDatePicker = ({ 
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
    const [isOpen, setIsOpen] = useState(false)
    const [currentView, setCurrentView] = useState<'main' | 'month' | 'year'>('main')
    const [selectedDate, setSelectedDate] = useState<Date | undefined>()
    const containerRef = useRef<HTMLDivElement>(null)

    // 将字符串日期转换为Date对象
    useEffect(() => {
      if (value && value.includes('/')) {
        const [month, day, year] = value.split('/')
        if (month && day && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          if (!isNaN(date.getTime())) {
            setSelectedDate(date)
          }
        }
      }
    }, [value])

    // 点击外部关闭
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setCurrentView('main')
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const currentDate = selectedDate || new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr || !dateStr.includes('/')) return 'Select a date'
      const [month, day, year] = dateStr.split('/')
      if (month && day && year) {
        return `${months[parseInt(month) - 1]} ${day}, ${year}`
      }
      return dateStr
    }

    const handleDateSelect = (day: number) => {
      const newDate = new Date(currentYear, currentMonth, day)
      setSelectedDate(newDate)
      const month = (newDate.getMonth() + 1).toString().padStart(2, '0')
      const dayStr = newDate.getDate().toString().padStart(2, '0')
      const year = newDate.getFullYear().toString()
      onChange(`${month}/${dayStr}/${year}`)
      setIsOpen(false)
      setCurrentView('main')
    }

    const handleMonthSelect = (monthIndex: number) => {
      const newDate = new Date(currentYear, monthIndex, Math.min(currentDate.getDate(), new Date(currentYear, monthIndex + 1, 0).getDate()))
      setSelectedDate(newDate)
      setCurrentView('main')
    }

    const handleYearSelect = (year: number) => {
      const newDate = new Date(year, currentMonth, Math.min(currentDate.getDate(), new Date(year, currentMonth + 1, 0).getDate()))
      setSelectedDate(newDate)
      setCurrentView('main')
    }

    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate()
    }

    const renderMainView = () => (
      <div className="space-y-4">
        {/* 月份年份选择器 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setCurrentView('month')}
            className="flex items-center space-x-1 px-3 py-2 text-lg font-semibold text-gray-800 hover:bg-gray-100 rounded"
          >
            <span>{months[currentMonth]}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => setCurrentView('year')}
            className="flex items-center space-x-1 px-3 py-2 text-lg font-semibold text-gray-800 hover:bg-gray-100 rounded"
          >
            <span>{currentYear}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {(() => {
            const firstDay = new Date(currentYear, currentMonth, 1)
            const lastDay = new Date(currentYear, currentMonth + 1, 0)
            const startDate = new Date(firstDay)
            startDate.setDate(startDate.getDate() - firstDay.getDay())
            
            const days = []
            for (let i = 0; i < 42; i++) {
              const date = new Date(startDate)
              date.setDate(date.getDate() + i)
              const isCurrentMonth = date.getMonth() === currentMonth
              const isSelected = selectedDate && 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
              const isToday = date.toDateString() === new Date().toDateString()
              
              if (i >= 35 && date.getMonth() !== currentMonth) break // 只显示必要的行
              
              days.push(
                <button
                  key={i}
                  type="button"
                  onClick={() => isCurrentMonth && handleDateSelect(date.getDate())}
                  className={`
                    h-9 w-9 rounded text-sm transition-colors font-medium
                    ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-100'}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${isToday && !isSelected ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' : ''}
                  `}
                  disabled={!isCurrentMonth}
                >
                  {date.getDate()}
                </button>
              )
            }
            return days
          })()}
        </div>
      </div>
    )

    const renderMonthView = () => (
      <div className="space-y-2">
        <div className="text-center text-lg font-semibold text-gray-800 mb-4">{currentYear}</div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              type="button"
              onClick={() => handleMonthSelect(index)}
              className={`
                px-4 py-3 text-sm font-medium rounded transition-colors
                ${index === currentMonth ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    )

    const renderYearView = () => {
      const startYear = Math.floor(currentYear / 10) * 10 - 5
      const years = Array.from({ length: 20 }, (_, i) => startYear + i)
      
      return (
        <div className="space-y-2">
          <div className="text-center text-lg font-semibold text-gray-800 mb-4">Select Year</div>
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleYearSelect(year)}
                className={`
                  px-3 py-2 text-sm font-medium rounded transition-colors
                  ${year === currentYear ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div ref={containerRef} className="relative">
        <input
          id={id}
          type="text"
          value={formatDisplayDate(value)}
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsOpen(true)}
          readOnly
          placeholder="Select a date"
          className={`
            flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm 
            ring-offset-background placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
            cursor-pointer
            ${hasError ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]">
            {currentView === 'main' && renderMainView()}
            {currentView === 'month' && renderMonthView()}
            {currentView === 'year' && renderYearView()}
            
            {/* 底部按钮 */}
            <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  handleDateSelect(today.getDate())
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded font-medium"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setCurrentView('main')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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

    // 改进的日期验证逻辑
    if (formData.depositDate && formData.moveOutDate) {
      // 解析MM/DD/YYYY格式的日期
      const parseDate = (dateStr: string) => {
        const [month, day, year] = dateStr.split('/')
        if (month && day && year) {
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }
        return null
      }

      const depositDate = parseDate(formData.depositDate)
      const moveOutDate = parseDate(formData.moveOutDate)
      
      if (depositDate && moveOutDate) {
        if (moveOutDate < depositDate) {
          newErrors.moveOutDate = "Move-out date must be after deposit payment date"
        }
      } else {
        if (!depositDate && formData.depositDate) {
          newErrors.depositDate = "Please enter a valid date (MM/DD/YYYY)"
        }
        if (!moveOutDate && formData.moveOutDate) {
          newErrors.moveOutDate = "Please enter a valid date (MM/DD/YYYY)"
        }
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

    if (!formData.forwardingAddress.trim()) {
      newErrors.forwardingAddress = "Your current address is required for legal compliance"
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
      trackEvent('form_validation_failed', {
        errors: Object.keys(errors),
        state: formData.state
      })
      return
    }

    setIsLoading(true)
    setShowSuccess(false)
    setApiError("")

    trackEvent('letter_generation_started', {
      state: formData.state,
      deposit_amount: formData.depositAmount
    })

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        trackEvent('letter_generation_failed', {
          status: response.status,
          state: formData.state
        })
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

      trackEvent('letter_generation_success', {
        state: formData.state,
        deposit_amount: formData.depositAmount,
        letter_length: letterText.length
      })

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
      trackEvent('letter_generation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        state: formData.state
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // Hide after 2 seconds
      
      trackEvent('letter_copied', {
        state: formData.state,
        method: 'clipboard_api'
      })
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.getElementById("letter") as HTMLTextAreaElement
      if (textarea) {
        textarea.select()
        document.execCommand("copy")
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
        
        trackEvent('letter_copied', {
          state: formData.state,
          method: 'exec_command'
        })
      }
    }
  }

  // Download as text file
  const downloadLetter = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedLetter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `deposit-demand-letter-${formData.tenantName.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    trackEvent('letter_downloaded', {
      state: formData.state,
      filename: `deposit-demand-letter-${formData.tenantName.replace(/\s+/g, "-").toLowerCase()}.txt`
    })
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
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm">
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

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Object.values(formData).filter(value => value.trim() !== '').length} / {Object.keys(formData).length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(Object.values(formData).filter(value => value.trim() !== '').length / Object.keys(formData).length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
                      <NativeDatePicker
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
                      <NativeDatePicker
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
                    <Label htmlFor="forwardingAddress" className="text-gray-700">
                      Your Current Address (Forwarding Address) *
                    </Label>
                    <Textarea
                      id="forwardingAddress"
                      value={formData.forwardingAddress}
                      onChange={(e) => handleInputChange("forwardingAddress", e.target.value)}
                      className={`mt-1 ${errors.forwardingAddress ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Your Full Name&#10;123 Current Street&#10;City, State, ZIP&#10;Phone: (555) 123-4567"
                      rows={4}
                    />
                    {errors.forwardingAddress && <p className="text-sm text-red-600 mt-1">{errors.forwardingAddress}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      This address will be used in the letter header and for receiving payment or correspondence.
                    </p>
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
                    className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700 hidden md:block"
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating Letter..." : "Generate Legal Demand Letter"}
                  </Button>
                </form>

                {/* Fixed bottom CTA for mobile */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating Letter..." : "Generate Legal Demand Letter"}
                  </Button>
                </div>

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
              </div>
              
              {/* Add bottom padding for mobile fixed button */}
              <div className="h-20 md:hidden"></div>
            </TabsContent>

            <TabsContent value="letter" className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm">
                {generatedLetter ? (
                  <div className="space-y-4">
                    {/* Enhanced success status bar */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-1 flex-shrink-0 mt-0.5">
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
                        <div className="flex-1">
                          <p className="text-green-800 font-medium text-sm mb-1">
                            Letter generated successfully
                          </p>
                          {formData.state && formData.moveOutDate && (
                            <p className="text-green-700 text-sm">
                              Statute deadline: {calculateStatutoryDeadline(formData.state, formData.moveOutDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Generated Letter</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyToClipboard}
                            className={`text-sm text-teal-600 hover:text-teal-700 ${copySuccess ? 'text-green-600' : ''}`}
                          >
                            {copySuccess ? 'Copied!' : 'Copy to clipboard'}
                          </button>
                          <button
                            onClick={downloadLetter}
                            className="text-sm text-teal-600 hover:text-teal-700"
                          >
                            Download
                          </button>
                        </div>
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
              </div>
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

