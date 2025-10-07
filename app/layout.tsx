import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Sawerni - Premium Photography Platform",
  description: "Algeria's premier photography platform connecting professional photographers with clients",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <body className="font-sans">
        <I18nProvider>
          {children}
          <Toaster position="top-right" richColors />
        </I18nProvider>
      </body>
    </html>
  )
}
