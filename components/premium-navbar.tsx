"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, LogIn, Mail, Info } from "lucide-react"
import Image from "next/image"

export function PremiumNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image src="/sawerni-logo.jpg" alt="Sawerni Logo" width={120} height={40} className="h-10 w-auto" />
          </Link>

          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="text-white font-semibold text-sm">www.Sawerni.com</span>
          </div>

          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-1 bg-[#2F3D7F]/80 backdrop-blur-sm rounded-full px-2 py-2 border border-white/10">
              <Link
                href="/"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-white/10 text-sm font-medium"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                href="/login"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-white/10 text-sm font-medium"
              >
                <LogIn className="h-4 w-4" />
                <span>Log in</span>
              </Link>
              <Link
                href="#contact"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-white/10 text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                <span>Contact</span>
              </Link>
              <Link
                href="#about"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-white/10 text-sm font-medium"
              >
                <Info className="h-4 w-4" />
                <span>About Us</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <Link href="/signup">
              <Button
                size="sm"
                className="text-sm px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-lg rounded-full font-semibold"
              >
                Try it for free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
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
                href="#contact"
                className="text-white hover:text-blue-300 transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-base"
              >
                <Mail className="h-5 w-5" />
                <span>Contact</span>
              </Link>
              <Link
                href="#about"
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
