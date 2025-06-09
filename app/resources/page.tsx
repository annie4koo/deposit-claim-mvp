import { Navbar } from "@/components/navbar"
import { FileText, ExternalLink, Download, BookOpen, Users, Phone } from "lucide-react"

const RESOURCES = [
  {
    category: "Legal Templates",
    items: [
      {
        title: "Move-Out Inspection Checklist",
        description: "Document property condition before leaving",
        type: "Download",
        icon: Download
      },
      {
        title: "Security Deposit Laws by State",
        description: "Complete reference guide for all 50 states",
        type: "Guide",
        icon: BookOpen
      },
      {
        title: "Sample Demand Letters",
        description: "Examples of effective demand letters",
        type: "Templates",
        icon: FileText
      }
    ]
  },
  {
    category: "Government Resources",
    items: [
      {
        title: "HUD Tenant Rights",
        description: "U.S. Department of Housing and Urban Development",
        type: "External",
        icon: ExternalLink
      },
      {
        title: "State Housing Authorities",
        description: "Contact information for state housing departments",
        type: "Directory",
        icon: Phone
      },
      {
        title: "Legal Aid Societies",
        description: "Free legal assistance organizations by state",
        type: "Directory",
        icon: Users
      }
    ]
  }
]

const FAQS = [
  {
    question: "How long does my landlord have to return my deposit?",
    answer: "This varies by state, ranging from 14 to 60 days. Most states require 30 days or less. Check your state's specific requirements in our State Laws section."
  },
  {
    question: "What can my landlord deduct from my security deposit?",
    answer: "Generally, landlords can only deduct for unpaid rent, cleaning beyond normal wear and tear, and damages beyond normal wear and tear. Normal wear and tear (like nail holes, minor scuffs) cannot be deducted."
  },
  {
    question: "Do I need a lawyer to recover my deposit?",
    answer: "Not necessarily. Many deposit disputes can be resolved with a properly written demand letter. Small claims court is also an option for amounts under the court's limit (usually $3,000-$10,000)."
  },
  {
    question: "What if my landlord doesn't respond to my demand letter?",
    answer: "You can file a case in small claims court. Many states also allow you to recover additional penalties and court costs if the landlord wrongfully withheld your deposit."
  },
  {
    question: "Can I get more than my deposit amount back?",
    answer: "Yes, in many states. If your landlord wrongfully withholds your deposit, you may be entitled to 2-3 times the deposit amount plus court costs and attorney fees."
  }
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources & Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to successfully recover your security deposit, from legal templates to expert guidance.
          </p>
        </div>

        {/* Resource Categories */}
        <div className="space-y-12 mb-16">
          {RESOURCES.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <div key={item.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
                          <item.icon className="h-6 w-6 text-teal-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {FAQS.map((faq, index) => (
              <div key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-teal-600 rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Your Deposit Back?</h2>
          <p className="text-teal-100 mb-6">
            Our AI-powered tool generates legally compliant demand letters in minutes.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-50"
          >
            Start Your Letter Now
          </a>
        </div>
      </main>
    </div>
  )
} 