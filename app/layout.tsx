import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Primary font: Poppins (Regular, Medium, Bold)
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Service IT+ - Unified Task & Time Management Dashboard",
  description:
    "Professional dashboard for managing tasks, time tracking, and resource allocation across multiple platforms",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/SERVICEITLOGO.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/SERVICEITLOGO.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/SERVICEITLOGO.png",
        type: "image/png",
      },
    ],
    apple: "/SERVICEITLOGO.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased bg-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
