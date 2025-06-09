import { Navbar } from "@/components/navbar"
import { Search, Calendar, DollarSign, Shield } from "lucide-react"

const STATE_EXAMPLES = [
  {
    state: "California",
    timeLimit: "21 days",
    penalties: "Up to 2x deposit amount",
    highlights: ["Must provide itemized deductions", "Interest required on deposits over $50"]
  },
  {
    state: "New York",
    timeLimit: "14 days",
    penalties: "Deposit + damages",
    highlights: ["Security deposit cannot exceed 1 month's rent", "Must be held in separate account"]
  },
  {
    state: "Texas",
    timeLimit: "30 days",
    penalties: "3x deposit amount + $100",
    highlights: ["Must provide written statement", "Tenant can request inspection"]
  },
  {
    state: "Florida",
    timeLimit: "15-30 days",
    penalties: "Actual damages + court costs",
    highlights: ["Time varies if claiming deductions", "Must notify tenant of claim procedures"]
  }
]

export default function StateLawsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">State Security Deposit Laws</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every state has different laws governing security deposits. Understanding your rights is the first step to recovering your deposit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Deadlines</h3>
            <p className="text-gray-600 text-sm">Ranges from 14 to 60 days depending on your state</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <DollarSign className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Penalty Amounts</h3>
            <p className="text-gray-600 text-sm">From 1x to 3x deposit amount plus damages</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <Shield className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Documentation</h3>
            <p className="text-gray-600 text-sm">Itemized lists, receipts, and written statements</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <Search className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Procedures</h3>
            <p className="text-gray-600 text-sm">Specific notification and claim procedures</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Sample State Requirements</h2>
            <p className="text-gray-600 mt-1">Examples of how security deposit laws vary by state</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {STATE_EXAMPLES.map((state) => (
              <div key={state.state} className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{state.state}</h3>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return Time Limit</p>
                    <p className="font-medium text-gray-900">{state.timeLimit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Penalties for Non-compliance</p>
                    <p className="font-medium text-gray-900">{state.penalties}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Key Requirements</p>
                    <ul className="text-sm text-gray-900">
                      {state.highlights.map((highlight, idx) => (
                        <li key={idx}>• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-teal-50 rounded-lg p-8 border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-900 mb-4">Important Note</h2>
          <p className="text-teal-800 mb-4">
            This information is for educational purposes only and represents general examples. Laws change frequently and can vary by city and county. Our letter generation tool incorporates the most current requirements for your specific location.
          </p>
          <p className="text-teal-800">
            For specific legal advice, please consult with a qualified attorney in your jurisdiction.
          </p>
        </div>

        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
          >
            Generate Your Letter Now
          </a>
        </div>
      </main>
    </div>
  )
} 