import { Button } from "@/components/ui/button"

interface LetterToolbarProps {
  letter: string
  onCopy?: () => void
  onDownload?: () => void
}

export function LetterToolbar({ letter, onCopy, onDownload }: LetterToolbarProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter)
      // 简单的成功提示，实际项目中可以用toast
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
    a.download = 'demand-letter.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    if (onDownload) onDownload()
  }

  return (
    <div className="sticky top-0 z-10 flex gap-2 bg-white/90 p-2 shadow">
      <Button onClick={handleCopy}>
        Copy
      </Button>

      <Button onClick={handleDownload}>
        Download TXT
      </Button>

      <Button 
        disabled 
        title="Email feature coming soon"
        className="opacity-40 cursor-not-allowed"
      >
        Email Landlord
      </Button>
    </div>
  )
} 