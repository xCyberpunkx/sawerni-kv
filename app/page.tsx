import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PremiumNavbar } from "@/components/premium-navbar"
import { Camera, Users, Star, ArrowRight, Shield, MessageCircle, Clock, Award, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-bold font-space-grotesk text-balance mb-8 leading-tight">
                <span className="text-primary">Capture</span>
                <br />
                <span className="text-accent">Perfect</span>
                <br />
                <span className="text-foreground">Moments</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-6 text-balance font-medium">
                Algeria's Premier Photography Platform
              </p>
              <p className="text-lg text-muted-foreground mb-12 max-w-xl text-pretty leading-relaxed">
                Connect with exceptional photographers across Algeria. From intimate portraits to grand celebrations,
                discover artists who transform your vision into timeless memories with unparalleled artistry and
                professionalism.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 button-premium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl"
                  >
                    Find Photographers
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-10 py-6 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent"
                  >
                    Join as Photographer
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="text-center animate-slide-in-left animate-delay-100">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-3xl font-bold text-primary font-space-grotesk">1000+</span>
                  <p className="text-sm text-muted-foreground font-medium">Happy Clients</p>
                </div>
                <div className="text-center animate-slide-in-left animate-delay-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Camera className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-3xl font-bold text-primary font-space-grotesk">200+</span>
                  <p className="text-sm text-muted-foreground font-medium">Pro Photographers</p>
                </div>
                <div className="text-center animate-slide-in-left animate-delay-300">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-3xl font-bold text-primary font-space-grotesk">4.9</span>
                  <p className="text-sm text-muted-foreground font-medium">Average Rating</p>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in animate-delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/professional-photographer-taking-wedding-photos-in.png"
                  alt="Professional photographer capturing wedding moments"
                  className="w-full h-[700px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-accent text-accent-foreground p-6 rounded-2xl shadow-xl animate-float">
                <Award className="h-10 w-10" />
              </div>
              <div className="absolute -top-8 -right-8 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl animate-glow">
                <Heart className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk mb-8 text-balance">Why Choose Sawerni?</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
              We've revolutionized photography services in Algeria, creating seamless connections between talented
              artists and discerning clients who demand excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <Card className="p-10 shadow-xl border-0 bg-card card-hover animate-fade-in-up animate-delay-100">
              <CardContent className="p-0 text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Shield className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-6">Verified Professionals</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Every photographer undergoes rigorous verification to ensure exceptional quality, reliability, and
                  artistic excellence in every project.
                </p>
              </CardContent>
            </Card>

            <Card className="p-10 shadow-xl border-0 bg-card card-hover animate-fade-in-up animate-delay-200">
              <CardContent className="p-0 text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MessageCircle className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-6">Direct Communication</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Engage directly with photographers to discuss your vision, negotiate pricing, and collaborate on
                  creating your perfect photography experience.
                </p>
              </CardContent>
            </Card>

            <Card className="p-10 shadow-xl border-0 bg-card card-hover animate-fade-in-up animate-delay-300">
              <CardContent className="p-0 text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Clock className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-6">Instant Booking</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Secure your photography session within minutes using our streamlined booking system with instant
                  confirmations and seamless scheduling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk mb-8 text-balance">How Sawerni Works</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
              A sophisticated, streamlined process designed to connect exceptional photographers with clients who
              appreciate artistic excellence.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 max-w-8xl mx-auto">
            {/* For Clients */}
            <div className="animate-fade-in-up animate-delay-100">
              <Card className="p-12 shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20 h-full">
                <CardContent className="p-0">
                  <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Users className="h-12 w-12 text-accent" />
                    </div>
                    <h3 className="text-4xl font-bold font-space-grotesk mb-6">For Clients</h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Discover exceptional photographers for your most important moments
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-accent-foreground font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-space-grotesk mb-3">Explore & Discover</h4>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Browse our curated collection of elite photographers. Filter by location, specialty, style,
                          and budget to find your perfect artistic match.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-accent-foreground font-bold text-lg">2</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-space-grotesk mb-3">Connect & Collaborate</h4>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Engage in meaningful conversations with photographers. Discuss your vision, negotiate terms,
                          and customize packages to perfectly suit your needs.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-accent-foreground font-bold text-lg">3</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-space-grotesk mb-3">Book & Experience</h4>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Secure your session with our protected payment system and enjoy a premium photography
                          experience crafted exclusively for you.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* For Photographers */}
            <div className="animate-fade-in-up animate-delay-200">
              <Card className="p-12 shadow-2xl border-0 bg-gradient-to-br from-accent/5 to-background h-full">
                <CardContent className="p-0">
                  <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Camera className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-4xl font-bold font-space-grotesk mb-6">For Photographers</h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Elevate your photography business and connect with premium clients
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-primary-foreground font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-space-grotesk mb-3">Showcase Your Artistry</h4>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Create a stunning portfolio that highlights your unique style, expertise, and artistic vision.
                          Set competitive rates and showcase your specialties.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-primary-foreground font-bold text-lg">2</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-space-grotesk mb-3">Engage Premium Clients</h4>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Receive high-quality booking requests, engage with discerning clients, and build lasting
                          professional relationships that elevate your career.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-primary-foreground font-bold text-lg">3</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-space-grotesk mb-3">Scale Your Business</h4>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          Utilize our comprehensive business tools to manage bookings, track revenue, collect
                          testimonials, and expand your professional network.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk mb-8 text-balance">Client Testimonials</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
              Discover why photographers and clients across Algeria choose Sawerni for their most important photography
              needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <Card className="p-8 shadow-xl border-0 bg-card animate-fade-in-up animate-delay-100">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="/happy-algerian-bride-smiling.png"
                    alt="Amina"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-lg font-space-grotesk">Amina K.</h4>
                    <p className="text-muted-foreground">Bride, Algiers</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  "Sawerni connected me with an extraordinary photographer who captured our wedding with such artistry
                  and emotion. The entire experience exceeded our expectations."
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 shadow-xl border-0 bg-card animate-fade-in-up animate-delay-200">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="/professional-algerian-businessman-headshot.png"
                    alt="Omar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-lg font-space-grotesk">Omar B.</h4>
                    <p className="text-muted-foreground">Photographer, Oran</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  "Since joining Sawerni, my business has transformed completely. The platform connects me with clients
                  who truly value professional photography and artistic vision."
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 shadow-xl border-0 bg-card animate-fade-in-up animate-delay-300">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src="/professional-algerian-woman-event-planner.png"
                    alt="Fatima"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-lg font-space-grotesk">Fatima M.</h4>
                    <p className="text-muted-foreground">Event Planner, Constantine</p>
                  </div>
                </div>
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  "As an event planner, I depend on Sawerni to find exceptional photographers for my clients. The
                  quality and professionalism are consistently outstanding."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-bold font-space-grotesk mb-8 text-balance">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto text-pretty leading-relaxed">
              Join thousands of photographers and clients who trust Sawerni to create extraordinary memories. Begin your
              journey with Algeria's premier photography platform today.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 button-premium bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl"
                >
                  <Users className="mr-3 h-6 w-6" />
                  Find Photographers
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-xl px-12 py-8 border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent"
                >
                  <Camera className="mr-3 h-6 w-6" />
                  Join as Photographer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Camera className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold font-space-grotesk">Sawerni</span>
              </div>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Algeria's premier photography platform connecting exceptional artists with discerning clients who demand
                excellence.
              </p>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-primary font-bold text-lg">f</span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-primary font-bold text-lg">@</span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <span className="text-primary font-bold text-lg">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-8 text-xl font-space-grotesk">Quick Links</h4>
              <div className="space-y-4">
                <Link
                  href="#photographers"
                  className="block text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Browse Photographers
                </Link>
                <Link
                  href="#services"
                  className="block text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Photography Services
                </Link>
                <Link
                  href="#about"
                  className="block text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  About Us
                </Link>
                <Link
                  href="#contact"
                  className="block text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-8 text-xl font-space-grotesk">For Professionals</h4>
              <div className="space-y-4">
                <Link
                  href="/signup"
                  className="block text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Join as Photographer
                </Link>
                <Link
                  href="/login"
                  className="block text-muted-foreground hover:text-primary transition-colors text-lg"
                >
                  Photographer Login
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors text-lg">
                  Success Stories
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-primary transition-colors text-lg">
                  Resources
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-8 text-xl font-space-grotesk">Contact Info</h4>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-center gap-3 text-lg">
                  <span className="w-3 h-3 bg-accent rounded-full"></span>
                  Algiers, Algeria
                </p>
                <p className="flex items-center gap-3 text-lg">
                  <span className="w-3 h-3 bg-accent rounded-full"></span>
                  hello@sawerni.dz
                </p>
                <p className="flex items-center gap-3 text-lg">
                  <span className="w-3 h-3 bg-accent rounded-full"></span>
                  +213 555 000 000
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-center md:text-left text-lg">
              &copy; 2024 Sawerni. All rights reserved.
            </p>
            <div className="flex gap-8 text-lg">
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
    </div>
  )
}
