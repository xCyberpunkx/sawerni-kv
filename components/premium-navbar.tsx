"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Camera, Star, Users, Award } from "lucide-react"

export function PremiumNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Camera className="h-10 w-10 text-primary group-hover:text-accent transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse group-hover:animate-bounce"></div>
            </div>
            <span className="text-3xl font-bold font-space-grotesk text-foreground group-hover:text-primary transition-all duration-500 transform group-hover:scale-105">
              Sawerni
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="#photographers"
              className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-2 text-lg font-medium"
            >
              <Users className="h-5 w-5" />
              <span>Photographers</span>
            </Link>
            <Link
              href="#services"
              className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-2 text-lg font-medium"
            >
              <Star className="h-5 w-5" />
              <span>Services</span>
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-2 text-lg font-medium"
            >
              <Award className="h-5 w-5" />
              <span>About</span>
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login">
              <Button
                variant="ghost"
                size="lg"
                className="text-lg hover:bg-muted transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                className="text-lg px-8 py-6 button-premium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-lg hover:bg-muted transition-colors duration-300"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border animate-fade-in-up">
            <div className="flex flex-col space-y-6">
              <Link
                href="#photographers"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-lg"
              >
                <Users className="h-5 w-5" />
                <span>Photographers</span>
              </Link>
              <Link
                href="#services"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-lg"
              >
                <Star className="h-5 w-5" />
                <span>Services</span>
              </Link>
              <Link
                href="#about"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center space-x-3 px-3 py-2 text-lg"
              >
                <Award className="h-5 w-5" />
                <span>About</span>
              </Link>
              <div className="flex flex-col space-y-4 pt-6 border-t border-border">
                <Link href="/login">
                  <Button variant="ghost" size="lg" className="w-full justify-start text-lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg">
                    Get Started
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
