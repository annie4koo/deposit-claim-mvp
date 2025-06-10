interface LetterToolbarProps {
  letter: string
  tenantName?: string
  onCopy?: () => void
  onDownload?: () => void
}

export function LetterToolbar({ letter, tenantName, onCopy, onDownload }: LetterToolbarProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter)
      if (onCopy) onCopy()
    } catch (err) {
      // 降级处理
      const textarea = document.createElement('textarea')
      textarea.value = letter
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (onCopy) onCopy()
    }
  }

  const handleDownload = () => {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tenantName 
      ? `deposit-demand-letter-${tenantName.replace(/\s+/g, '-').toLowerCase()}.txt`
      : 'deposit-demand-letter.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    if (onDownload) onDownload()
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Letter
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download TXT
        </button>
        
        <button
          disabled
          title="📧 Email feature coming soon! For now, copy the letter and paste it into your email client."
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Landlord
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Soon</span>
        </button>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600">
          💡 Tip: Send via <strong>Certified Mail</strong> with Return Receipt Requested for legal proof of delivery
        </p>
      </div>
    </div>
  )
} 