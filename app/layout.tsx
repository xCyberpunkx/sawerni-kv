import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ADLaM_Display as Adlam_Display } from "next/font/google"

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
const adlamDisplay = Adlam_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-adlam-display",
})
export const metadata: Metadata = {
  title: "Sawerni - Premium Photography Platform",
  description:
    "Algeria's premier photography platform connecting professional photographers with clients",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${adlamDisplay.variable} antialiased`}
    >
      <head>
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/adlamdisplay/v1/ADLaMDisplay-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  )
}