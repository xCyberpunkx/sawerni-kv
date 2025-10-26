"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { Home, LogIn, Mail, Info } from "lucide-react"

export function PremiumNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-white/10"
      style={{
        background: `linear-gradient(to right, #0A1240, #474EB8)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center group">
              <Image src="/sawerni-logo.png" alt="Sawerni Logo" width={160} height={60} className="h-50 w-50" />
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="text-sm px-6 py-2 text-white shadow-lg rounded-full font-semibold border border-white/30 transition-all duration-300 hover:opacity-90"
                style={{
                  backgroundColor: "#474EB8",
                }}
              >
                Try It For Free
              </Button>
            </Link>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="text-white font-semibold text-sm tracking-wide">www.Sawerni.com</span>
          </div>

          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-0 bg-white/10 backdrop-blur-md rounded-full px-2 py-2 border border-white/30">
              <Link
                href="/"
                className="text-white hover:text-white transition-colors duration-300 px-5 py-2 rounded-full hover:bg-white/20 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="text-white hover:text-white transition-colors duration-300 px-5 py-2 rounded-full hover:bg-white/20 text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-white transition-colors duration-300 px-5 py-2 rounded-full hover:bg-white/20 text-sm font-medium"
              >
                Contact
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-white transition-colors duration-300 px-5 py-2 rounded-full hover:bg-white/20 text-sm font-medium"
              >
                About Us
              </Link>
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-lg hover:bg-white/10 transition-colors duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/10 animate-fade-in-up">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-base"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link
                href="/login"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-base"
              >
                <LogIn className="h-5 w-5" />
                <span>Log in</span>
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-base"
              >
                <Mail className="h-5 w-5" />
                <span>Contact</span>
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-base"
              >
                <Info className="h-5 w-5" />
                <span>About Us</span>
              </Link>
              <div className="flex flex-col space-y-4 pt-4 border-t border-white/10">
                <Link href="/signup">
                  <Button size="lg" className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-base rounded-full">
                    Try it for free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
