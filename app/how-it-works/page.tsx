import { Navbar } from "@/components/navbar"
import { ArrowRight, ClipboardCheck, FileText, Send } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it easy to recover your security deposit through a simple, step-by-step process based on your state's specific landlord-tenant laws.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-lg mb-6 mx-auto">
              <ClipboardCheck className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">1. Fill Out Form</h3>
            <p className="text-gray-600 text-center">
              Provide your rental details, deposit amount, move-out date, and landlord information. Our form guides you through all required information.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-lg mb-6 mx-auto">
              <FileText className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">2. Generate Letter</h3>
            <p className="text-gray-600 text-center">
              Our AI generates a professional legal demand letter customized for your state's laws and your specific situation.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-lg mb-6 mx-auto">
              <Send className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">3. Send & Follow Up</h3>
            <p className="text-gray-600 text-center">
              Copy the generated letter and send it to your landlord. The letter includes all legal requirements and deadlines for your state.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Our Approach Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">State-Specific Legal Requirements</h3>
              <p className="text-gray-600 mb-4">
                Each state has different laws regarding security deposits. Our system incorporates specific legal requirements, deadlines, and procedures for all 50 states.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Legal Language</h3>
              <p className="text-gray-600">
                The generated letters use proper legal terminology and format that landlords and property managers recognize and respect.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clear Deadlines & Consequences</h3>
              <p className="text-gray-600 mb-4">
                Each letter clearly states the legal deadlines for response and the potential consequences if the landlord fails to comply.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentation for Court</h3>
              <p className="text-gray-600">
                If needed, the letter serves as proper documentation of your demand for court proceedings.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </main>
    </div>
  )
} 