"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { LockIcon, FileTextIcon, BookIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { stateLaw } from "@/lib/stateLaw"
import { calculateStatutoryDeadline } from "@/lib/stateLaw"
import { LetterToolbar } from "@/components/LetterToolbar"
import { useAuth } from "@/contexts/AuthContext"

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
  const { user, isLoading: authLoading } = useAuth()
  
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
  const [emailSending, setEmailSending] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [showReminderDialog, setShowReminderDialog] = useState(false)

  // Enhanced event tracking function (ready for GA/PostHog integration)
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Console log for now - can be replaced with actual analytics
    console.log('🔍 Analytics Event:', eventName, properties)
    
    // Enhanced data for conversion funnel analysis
    const enhancedProperties: Record<string, any> = {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: typeof window !== 'undefined' ? sessionStorage.getItem('session_id') || 'anonymous' : 'ssr',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      page_url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }
    
    // Ready for Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        custom_parameter_1: enhancedProperties.state,
        custom_parameter_2: enhancedProperties.deposit_amount,
        event_category: 'deposit_recovery',
        event_label: enhancedProperties.state || 'unknown',
        value: enhancedProperties.deposit_amount ? parseFloat(enhancedProperties.deposit_amount) : 0
      })
    }
    
    // Ready for PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(eventName, enhancedProperties)
    }
    
    // Ready for Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, enhancedProperties)
    }
  }

  useEffect(() => {
    // Force English locale for the entire document and all date inputs
    document.documentElement.lang = 'en-US'
    document.documentElement.setAttribute('data-locale', 'en-US')
    
    // Set multiple meta tags for locale forcing
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[http-equiv="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        if (name.includes('-')) {
          meta.setAttribute('http-equiv', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }
    
    setMetaTag('Content-Language', 'en-US')
    setMetaTag('language', 'en-US')
    setMetaTag('locale', 'en-US')
    
    // Force date inputs to use English locale and disable manual input
    const configureDateInputs = () => {
      const dateInputs = document.querySelectorAll('input[type="date"]')
      dateInputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement
        
        // Set comprehensive locale attributes
        htmlInput.setAttribute('lang', 'en-US')
        htmlInput.setAttribute('data-locale', 'en-US')
        htmlInput.setAttribute('data-date-format', 'MM/DD/YYYY')
        htmlInput.setAttribute('data-lang', 'en-US')
        
        // Force webkit browsers to use English
        htmlInput.style.setProperty('-webkit-locale', '"en-US"', 'important')
        htmlInput.style.setProperty('locale', 'en-US', 'important')
        htmlInput.style.setProperty('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 'important')
        
        // Completely disable manual input - make it readonly always
        htmlInput.setAttribute('readonly', 'readonly')
        htmlInput.style.cursor = 'pointer'
        htmlInput.style.caretColor = 'transparent'
        
        // Remove any existing event listeners and add new ones
        const newInput = htmlInput.cloneNode(true) as HTMLInputElement
        htmlInput.parentNode?.replaceChild(newInput, htmlInput)
        
        // Add click handler to temporarily remove readonly for date picker
        newInput.addEventListener('click', (e) => {
          e.preventDefault()
          newInput.removeAttribute('readonly')
          newInput.showPicker?.()
          setTimeout(() => {
            newInput.setAttribute('readonly', 'readonly')
          }, 100)
        })
        
        // Add focus handler
        newInput.addEventListener('focus', (e) => {
          newInput.removeAttribute('readonly')
          setTimeout(() => {
            newInput.showPicker?.()
          }, 10)
        })
        
        // Add blur handler to restore readonly
        newInput.addEventListener('blur', () => {
          setTimeout(() => {
            newInput.setAttribute('readonly', 'readonly')
          }, 100)
        })
        
        // Completely block all keyboard input except navigation
        newInput.addEventListener('keydown', (e) => {
          // Allow only tab, escape, enter for navigation
          if (['Tab', 'Escape', 'Enter'].includes(e.key)) {
            return
          }
          // Block everything else
          e.preventDefault()
          e.stopPropagation()
          return false
        })
        
        // Block keypress and keyup as well
        newInput.addEventListener('keypress', (e) => {
          if (!['Tab', 'Escape', 'Enter'].includes(e.key)) {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        })
        
        newInput.addEventListener('keyup', (e) => {
          if (!['Tab', 'Escape', 'Enter'].includes(e.key)) {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        })
        
        // Block input event for extra safety
        newInput.addEventListener('input', (e) => {
          // Only allow programmatic changes (from date picker)
          if (!e.isTrusted) return
          
          // If it's a manual input attempt, prevent it
          const target = e.target as HTMLInputElement
          if (target.readOnly) {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        })
      })
    }
    
    // Configure immediately
    configureDateInputs()
    
    // Use MutationObserver to handle dynamically added date inputs
    const observer = new MutationObserver((mutations) => {
      let shouldReconfigure = false
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName === 'INPUT' && element.getAttribute('type') === 'date') {
                shouldReconfigure = true
              } else if (element.querySelector && element.querySelector('input[type="date"]')) {
                shouldReconfigure = true
              }
            }
          })
        }
      })
      if (shouldReconfigure) {
        setTimeout(configureDateInputs, 10)
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['type']
    })
    
    // Add comprehensive CSS to force English date format display
    const style = document.createElement('style')
    style.id = 'date-input-english-force'
    style.textContent = `
      /* Force English locale on all date inputs */
      input[type="date"] {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        -webkit-locale: "en-US" !important;
        locale: en-US !important;
        caret-color: transparent !important;
        cursor: pointer !important;
      }
      
      /* Force English on all webkit date picker pseudo-elements */
      input[type="date"]::-webkit-datetime-edit {
        -webkit-locale: "en-US" !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      
      input[type="date"]::-webkit-datetime-edit-fields-wrapper {
        -webkit-locale: "en-US" !important;
      }
      
      input[type="date"]::-webkit-datetime-edit-text {
        -webkit-locale: "en-US" !important;
        color: #6b7280 !important;
      }
      
      input[type="date"]::-webkit-datetime-edit-month-field {
        -webkit-locale: "en-US" !important;
      }
      
      input[type="date"]::-webkit-datetime-edit-day-field {
        -webkit-locale: "en-US" !important;
      }
      
      input[type="date"]::-webkit-datetime-edit-year-field {
        -webkit-locale: "en-US" !important;
      }
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        -webkit-locale: "en-US" !important;
        cursor: pointer !important;
      }
      
      /* Hide any Chinese characters that might appear */
      input[type="date"]::-webkit-datetime-edit-text:contains("年"),
      input[type="date"]::-webkit-datetime-edit-text:contains("月"),
      input[type="date"]::-webkit-datetime-edit-text:contains("日") {
        display: none !important;
      }
      
      /* Force readonly appearance */
      input[type="date"][readonly] {
        background-color: white !important;
        cursor: pointer !important;
        caret-color: transparent !important;
      }
      
      /* Additional webkit locale forcing */
      input[type="date"]:lang(zh),
      input[type="date"]:lang(zh-CN),
      input[type="date"]:lang(zh-TW) {
        -webkit-locale: "en-US" !important;
        locale: en-US !important;
      }
    `
    document.head.appendChild(style)
    
    // Force browser locale settings
    if (typeof window !== 'undefined') {
      // Override navigator.language temporarily for date inputs
      Object.defineProperty(navigator, 'language', {
        get: () => 'en-US',
        configurable: true
      })
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
        configurable: true
      })
    }
    
    // Cleanup function
    return () => {
      observer.disconnect()
      const styleElement = document.getElementById('date-input-english-force')
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 必填字段验证
    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Your name is required"
    } else if (formData.tenantName.trim().length < 2) {
      newErrors.tenantName = "Name must be at least 2 characters"
    }

    if (!formData.state) {
      newErrors.state = "State is required"
    }

    if (!formData.rentalAddress.trim()) {
      newErrors.rentalAddress = "Rental address is required"
    } else if (formData.rentalAddress.trim().length < 10) {
      newErrors.rentalAddress = "Please enter a complete address"
    }

    // 金额验证：必须>0
    if (!formData.depositAmount.trim()) {
      newErrors.depositAmount = "Deposit amount is required"
    } else {
      const amount = Number.parseFloat(formData.depositAmount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.depositAmount = "Deposit amount must be greater than 0"
      }
    }

    // 日期格式验证
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!formData.depositDate.trim()) {
      newErrors.depositDate = "Deposit payment date is required"
    } else if (!dateRegex.test(formData.depositDate)) {
      newErrors.depositDate = "Date must be in MM/DD/YYYY format"
    }

    if (!formData.moveOutDate.trim()) {
      newErrors.moveOutDate = "Move-out date is required"
    } else if (!dateRegex.test(formData.moveOutDate)) {
      newErrors.moveOutDate = "Date must be in MM/DD/YYYY format"
    }

    // 日期顺序验证：moveOut >= depositDate
    if (formData.depositDate && formData.moveOutDate && dateRegex.test(formData.depositDate) && dateRegex.test(formData.moveOutDate)) {
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
          newErrors.moveOutDate = "Move-out date must be on or after deposit payment date"
        }
      }
    }

    if (!formData.landlordInfo.trim()) {
      newErrors.landlordInfo = "Landlord information is required"
    } else if (formData.landlordInfo.trim().length < 10) {
      newErrors.landlordInfo = "Please provide complete landlord name and address"
    }

    // Email格式验证
    if (!formData.tenantEmail.trim()) {
      newErrors.tenantEmail = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.tenantEmail)) {
      newErrors.tenantEmail = "Please enter a valid email address"
    }

    if (!formData.forwardingAddress.trim()) {
      newErrors.forwardingAddress = "Current address is required for legal compliance"
    } else if (formData.forwardingAddress.trim().length < 10) {
      newErrors.forwardingAddress = "Please provide a complete forwarding address"
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
    
    // Track form progress for conversion optimization
    const completedFields = Object.values({...formData, [field]: value}).filter(v => v.trim() !== '').length
    const totalFields = Object.keys(formData).length
    const progressPercentage = Math.round((completedFields / totalFields) * 100)
    
    trackEvent('form_field_completed', {
      field,
      progress_percentage: progressPercentage,
      completed_fields: completedFields,
      total_fields: totalFields,
      state: formData.state || value // 如果是state字段，使用新值
    })
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

  // Email sending function
  const sendEmail = async () => {
    if (!formData.landlordInfo.includes('@')) {
      setEmailError("Landlord email address is required for email sending")
      return
    }

    setEmailSending(true)
    setEmailError("")

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.landlordInfo.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || formData.landlordInfo,
          subject: `Security Deposit Return Request - ${formData.tenantName}`,
          letterContent: generatedLetter,
          tenantName: formData.tenantName
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      const result = await response.json()
      setEmailSuccess(true)
      setShowReminderDialog(true)
      
      // Setup reminders
      await fetch("/api/setup-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantName: formData.tenantName,
          tenantEmail: formData.tenantEmail,
          landlordEmail: formData.landlordInfo.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0],
          amount: formData.depositAmount,
          state: formData.state,
          moveOutDate: formData.moveOutDate
        }),
      })

      trackEvent('email_sent', {
        state: formData.state,
        deposit_amount: formData.depositAmount
      })
    } catch (error) {
      setEmailError("Failed to send email. Please try again or copy the letter manually.")
      trackEvent('email_send_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setEmailSending(false)
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

  // 检查表单是否完整（所有字段都有值）
  const isFormComplete = useMemo(() => {
    return formData.tenantName.trim() !== '' &&
           formData.state !== '' &&
           formData.rentalAddress.trim() !== '' &&
           formData.depositAmount.trim() !== '' &&
           formData.depositDate.trim() !== '' &&
           formData.moveOutDate.trim() !== '' &&
           formData.landlordInfo.trim() !== '' &&
           formData.tenantEmail.trim() !== '' &&
           formData.forwardingAddress.trim() !== ''
  }, [formData])

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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <Tabs defaultValue="form" value={activeTab} onValueChange={(value) => {
            setActiveTab(value)
            trackEvent('tab_switched', {
              from_tab: activeTab,
              to_tab: value,
              has_generated_letter: !!generatedLetter,
              form_completion: Math.round((Object.values(formData).filter(v => v.trim() !== '').length / Object.keys(formData).length) * 100)
            })
          }} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50">
              <TabsList className="h-14 w-full bg-transparent rounded-none border-b border-gray-200 px-6">
                <TabsTrigger
                  value="form"
                  className="data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:bg-white rounded-t-lg border-b-2 border-transparent px-6"
                >
                  📝 Form
                </TabsTrigger>
                <TabsTrigger
                  value="letter"
                  className="data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:bg-white rounded-t-lg border-b-2 border-transparent px-6"
                >
                  📄 Generated Letter
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
                      <select
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className={`mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="" disabled>Select your state</option>
                        {US_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
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
                      <input
                        id="depositDate"
                        type="date"
                        placeholder="MM/DD/YYYY"
                        value={formData.depositDate ? formData.depositDate.split('/').reverse().join('-') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [year, month, day] = e.target.value.split('-')
                            handleInputChange("depositDate", `${month}/${day}/${year}`)
                          } else {
                            handleInputChange("depositDate", '')
                          }
                        }}
                        className={`mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.depositDate ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.depositDate && <p className="text-sm text-red-600 mt-1">{errors.depositDate}</p>}
                    </div>

                    <div>
                      <Label htmlFor="moveOutDate" className="text-gray-700">
                        Move-Out Date *
                      </Label>
                      <input
                        id="moveOutDate"
                        type="date"
                        placeholder="MM/DD/YYYY"
                        value={formData.moveOutDate ? formData.moveOutDate.split('/').reverse().join('-') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [year, month, day] = e.target.value.split('-')
                            handleInputChange("moveOutDate", `${month}/${day}/${year}`)
                          } else {
                            handleInputChange("moveOutDate", '')
                          }
                        }}
                        className={`mt-1 w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.moveOutDate ? "border-red-500" : "border-gray-300"}`}
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
                    <Label htmlFor="forwardingAddress" className="text-gray-700 flex items-center gap-2">
                      Your Current Address (Forwarding Address) *
                      <div className="relative group">
                        <svg className="h-4 w-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64">
                          💡 Important: Send your letter via Certified Mail with Return Receipt Requested to prove delivery. Keep the receipt as legal evidence.
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
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

                  <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600">
                        Form completeness: {Math.round((Object.values(formData).filter(v => v.trim() !== '').length / Object.keys(formData).length) * 100)}%
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isLoading || !isFormComplete}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </div>
                        ) : (
                          "Generate Letter"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="letter" className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm">
                {generatedLetter ? (
                  <div className="space-y-4">
                    {/* Enhanced success alert with statutory deadline */}
                    <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-500 rounded-full p-1.5 flex-shrink-0 mt-0.5">
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
                            className="text-white"
                          >
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-green-800 font-bold text-base mb-2">
                            ✅ Letter Generated Successfully!
                          </h3>
                          {formData.state && formData.moveOutDate && (
                            <div className="bg-white rounded-md p-3 border border-green-200">
                              <p className="text-green-700 font-medium text-sm mb-1">
                                📅 Statutory Deadline Information:
                              </p>
                              <p className="text-green-800 font-semibold">
                                {calculateStatutoryDeadline(formData.state, formData.moveOutDate)}
                              </p>
                              <p className="text-green-600 text-xs mt-1">
                                Your landlord had until this date to return your deposit or provide itemized deductions.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Letter Toolbar */}
                    <LetterToolbar 
                      letter={generatedLetter}
                      onCopy={() => {
                        setCopySuccess(true)
                        setTimeout(() => setCopySuccess(false), 2000)
                        trackEvent('letter_copied', {
                          state: formData.state,
                          method: 'toolbar'
                        })
                      }}
                      onDownload={() => {
                        trackEvent('letter_downloaded', {
                          state: formData.state,
                          method: 'toolbar'
                        })
                      }}
                    />

                    {/* Email Sending Section */}
                    {formData.landlordInfo.includes('@') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                          📧 Send Email to Landlord
                        </h4>
                        <p className="text-blue-700 text-sm mb-3">
                          Send this letter directly to your landlord's email address.
                        </p>
                        {emailError && (
                          <div className="bg-red-100 border border-red-300 rounded p-2 mb-3">
                            <p className="text-red-700 text-sm">{emailError}</p>
                          </div>
                        )}
                        {emailSuccess && (
                          <div className="bg-green-100 border border-green-300 rounded p-2 mb-3">
                            <p className="text-green-700 text-sm">✅ Email sent successfully!</p>
                          </div>
                        )}
                        <Button
                          onClick={sendEmail}
                          disabled={emailSending || emailSuccess}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {emailSending ? "Sending..." : emailSuccess ? "Email Sent" : "Send Email"}
                        </Button>
                      </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                      {/* Header bar with gradient */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          📄 Your Legal Demand Letter
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ready to Send</span>
                        </h3>
                      </div>
                      <Textarea
                        id="letter"
                        value={generatedLetter}
                        readOnly
                        rows={20}
                        className="font-mono text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50"
                      />
                    </div>

                    {copySuccess && (
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✓ Copied to clipboard!
                        </span>
                      </div>
                    )}

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

      {showReminderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowReminderDialog(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">📧 Email Sent Successfully!</h2>
                <button
                  onClick={() => setShowReminderDialog(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-green-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Letter Delivered</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Your demand letter has been sent to your landlord's email address.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-blue-800 font-semibold mb-2">🔔 Automatic Reminders Enabled</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    We've set up automatic reminders for your deposit claim:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">T-3</span>
                      <span>Reminder 3 days before deadline</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">T+2</span>
                      <span>Follow-up 2 days after deadline</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowReminderDialog(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

