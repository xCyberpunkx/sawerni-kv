import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PremiumNavbar } from "@/components/premium-navbar"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { WhereFindUsSection } from "@/components/where-find-us-section"
import { DiscoverPhotographersSection } from "@/components/discover-photographers-section"
import { PremiumFooter } from "@/components/premium-footer"
import { Camera, Users, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-[#2F3D7F] to-slate-900">
        {/* Background Image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/professional-photography-studio-with-lighting-equi.jpg"
            alt="Photography studio background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-[#2F3D7F]/70 to-slate-900/90" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-7xl md:text-9xl font-bold font-space-grotesk text-balance mb-6 leading-tight text-white animate-fade-in-up tracking-tight drop-shadow-2xl">
              SAWERNI
            </h1>
            <p
              className="text-2xl md:text-3xl text-white/90 mb-8 font-medium drop-shadow-lg"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              كل لحظة تساهل تبقى ذكرى
            </p>
            <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-4xl mx-auto text-balance leading-relaxed animate-fade-in-up animate-delay-100">
              The First Algerian Platform for online reservations, connecting clients with
            </p>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto text-balance leading-relaxed animate-fade-in-up animate-delay-200">
              professional photographers easily and quickly.
            </p>
            <p className="text-lg md:text-xl text-white/70 mb-12 italic animate-fade-in-up animate-delay-300">
              Every moment deserves to become a memory
            </p>

            <Link href="#how-it-works">
              <Button
                size="lg"
                className="text-lg px-12 py-7 button-premium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl rounded-full font-semibold animate-fade-in-up animate-delay-400 border-2 border-blue-400/30"
              >
                Explore Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Why Choose Section */}
      <WhyChooseSection />

      {/* Where Can You Find Us Section */}
      <WhereFindUsSection />

      {/* Discover Photographers Section */}
      <DiscoverPhotographersSection />

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk mb-8 text-balance text-white">
              Client Testimonials
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto text-pretty leading-relaxed">
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
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-[#2F3D7F] via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-bold font-space-grotesk mb-8 text-balance text-white drop-shadow-lg">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-4xl mx-auto text-pretty leading-relaxed">
              Join thousands of photographers and clients who trust Sawerni to create extraordinary memories. Begin your
              journey with Algeria's premier photography platform today.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 button-premium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl border-2 border-blue-400/30"
                >
                  <Users className="mr-3 h-6 w-6" />
                  Find Photographers
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-xl px-12 py-8 border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 bg-transparent text-white backdrop-blur-sm"
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
      <PremiumFooter />
    </div>
  )
}
