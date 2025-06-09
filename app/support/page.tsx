import { Navbar } from "@/components/navbar"
import { Mail, MessageCircle, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react"

const CONTACT_OPTIONS = [
  {
    type: "Email Support",
    description: "Get help within 24 hours",
    contact: "support@depositrecovery.com",
    hours: "24/7",
    icon: Mail
  },
  {
    type: "Live Chat",
    description: "Instant help during business hours",
    contact: "Click chat bubble below",
    hours: "Mon-Fri 9AM-6PM EST",
    icon: MessageCircle
  },
  {
    type: "Phone Support",
    description: "Speak with our experts",
    contact: "1-800-DEPOSIT",
    hours: "Mon-Fri 9AM-6PM EST",
    icon: Phone
  }
]

const COMMON_ISSUES = [
  {
    title: "My letter generation failed",
    solution: "Try refreshing the page and filling out the form again. If the issue persists, contact our support team.",
    type: "technical"
  },
  {
    title: "I need to update information in my letter",
    solution: "Simply fill out the form again with the correct information. Each generation creates a new letter.",
    type: "usage"
  },
  {
    title: "My landlord hasn't responded to the letter",
    solution: "Wait for your state's required response period. If they don't respond, you can proceed to small claims court.",
    type: "legal"
  },
  {
    title: "The generated letter doesn't look right",
    solution: "Check that all your information was entered correctly. Contact support if you believe there's an error in the template.",
    type: "technical"
  }
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help you successfully recover your security deposit. Get support, find answers, or contact our team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {CONTACT_OPTIONS.map((option) => (
            <div key={option.type} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-lg mb-6 mx-auto">
                <option.icon className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{option.type}</h3>
              <p className="text-gray-600 mb-4">{option.description}</p>
              <p className="font-medium text-gray-900 mb-2">{option.contact}</p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {option.hours}
              </div>
            </div>
          ))}
        </div>

        {/* Common Issues */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Common Issues & Solutions</h2>
            <p className="text-gray-600 mt-1">Quick fixes for the most common problems</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {COMMON_ISSUES.map((issue, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {issue.type === 'technical' ? (
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    ) : issue.type === 'legal' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <MessageCircle className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
                    <p className="text-gray-600">{issue.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Updates */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h3>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-900 font-medium">All systems operational</span>
            </div>
            <p className="text-gray-600 text-sm">Last updated: 2 minutes ago</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Updates</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">• Updated state law database (Jan 2024)</li>
              <li className="text-gray-600">• Improved letter generation speed</li>
              <li className="text-gray-600">• Added new validation features</li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option>Select a topic</option>
                <option>Technical Issue</option>
                <option>Letter Generation Problem</option>
                <option>Legal Question</option>
                <option>General Inquiry</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Describe your issue or question in detail..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Call to Action */}
        <div className="bg-teal-600 rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Generate Your Letter?</h2>
          <p className="text-teal-100 mb-6">
            Start creating your professional demand letter now.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-50"
          >
            Get Started
          </a>
        </div>
      </main>
    </div>
  )
} 