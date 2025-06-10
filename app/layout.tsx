import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Deposit Recovery - Free Legal Demand Letter Generator",
  description: "Generate professional legal demand letters to recover your security deposit. State-specific templates based on landlord-tenant laws for all 50 US states. Free, secure, and lawyer-reviewed.",
  keywords: "security deposit, landlord tenant law, demand letter, rental deposit recovery, tenant rights, legal letter generator",
  authors: [{ name: "Deposit Recovery" }],
  creator: "Deposit Recovery",
  publisher: "Deposit Recovery",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://deposit-claim-mvp.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Free Security Deposit Recovery Tool - Generate Legal Demand Letters",
    description: "Professional legal demand letter generator for recovering rental security deposits. State-specific templates, instant generation, completely free.",
    url: 'https://deposit-claim-mvp.vercel.app',
    siteName: 'Deposit Recovery',
    images: [
      {
        url: '/og-image.jpg', // We'll need to create this
        width: 1200,
        height: 630,
        alt: 'Deposit Recovery - Legal Demand Letter Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free Security Deposit Recovery Tool",
    description: "Generate professional legal demand letters to recover your rental security deposit instantly.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-US">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
