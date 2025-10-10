import Link from "next/link"
import { Camera, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function PremiumFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Camera className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
              <span className="text-3xl font-bold font-space-grotesk">Sawerni</span>
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Algeria's premier photography platform connecting exceptional artists with discerning clients who demand
              excellence.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              >
                <Facebook className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Link>
              <Link
                href="#"
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              >
                <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Link>
              <Link
                href="#"
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              >
                <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-xl font-space-grotesk">Quick Links</h4>
            <div className="space-y-4">
              <Link
                href="#photographers"
                className="block text-muted-foreground hover:text-primary transition-colors text-lg group"
              >
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  Browse Photographers
                </span>
              </Link>
              <Link
                href="#services"
                className="block text-muted-foreground hover:text-primary transition-colors text-lg group"
              >
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  Photography Services
                </span>
              </Link>
              <Link
                href="#about"
                className="block text-muted-foreground hover:text-primary transition-colors text-lg group"
              >
                <span className="inline-block transition-transform group-hover:translate-x-1">About Us</span>
              </Link>
              <Link
                href="#contact"
                className="block text-muted-foreground hover:text-primary transition-colors text-lg group"
              >
                <span className="inline-block transition-transform group-hover:translate-x-1">Contact</span>
              </Link>
            </div>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-bold mb-6 text-xl font-space-grotesk">For Professionals</h4>
            <div className="space-y-4">
              <Link
                href="/signup"
                className="block text-muted-foreground hover:text-primary transition-colors text-lg group"
              >
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  Join as Photographer
                </span>
              </Link>
              <Link
                href="/login"
                className="block text-muted-foreground hover:text-primary transition-colors text-lg group"
              >
                <span className="inline-block transition-transform group-hover:translate-x-1">Photographer Login</span>
              </Link>
              <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors text-lg group">
                <span className="inline-block transition-transform group-hover:translate-x-1">Success Stories</span>
              </Link>
              <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors text-lg group">
                <span className="inline-block transition-transform group-hover:translate-x-1">Resources</span>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-6 text-xl font-space-grotesk">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-muted-foreground group">
                <MapPin className="h-5 w-5 text-accent mt-1 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-lg">Algiers, Algeria</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground group">
                <Mail className="h-5 w-5 text-accent mt-1 flex-shrink-0 transition-transform group-hover:scale-110" />
                <Link href="mailto:hello@sawerni.dz" className="text-lg hover:text-primary transition-colors">
                  hello@sawerni.dz
                </Link>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground group">
                <Phone className="h-5 w-5 text-accent mt-1 flex-shrink-0 transition-transform group-hover:scale-110" />
                <Link href="tel:+213555000000" className="text-lg hover:text-primary transition-colors">
                  +213 555 000 000
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-center md:text-left text-lg">
            &copy; 2025 Sawerni. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
