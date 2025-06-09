import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DepositRecovery - Get Your Security Deposit Back",
  description:
    "Generate professional legal demand letters to recover your rental security deposit. Free AI-powered tool for tenants across all 50 US states.",
  keywords: "security deposit, rental deposit, tenant rights, legal letter, demand letter, landlord tenant law",
  authors: [{ name: "DepositRecovery" }],
  openGraph: {
    title: "DepositRecovery - Get Your Security Deposit Back",
    description: "Generate professional legal demand letters to recover your rental security deposit.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-US">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
