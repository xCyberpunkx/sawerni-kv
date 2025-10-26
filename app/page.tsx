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
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/hero-studio.jpg"
            alt="Photography studio background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1
              className="text-7xl md:text-9xl text-balance mb-6 leading-tight text-white animate-fade-in-up tracking-tight drop-shadow-2xl font-normal"
              style={{ fontFamily: "var(--font-adlam-display)" }}
            >
              SAWERNI
            </h1>
            <p
              className="text-2xl md:text-3xl text-white/90 mb-8 font-medium drop-shadow-lg"
              style={{ fontFamily: "var(--font-adlam-display)" }}
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

            <div className="flex flex-col sm:flex-row gap-8 justify-center animate-fade-in-up animate-delay-400">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-lg px-12 py-7 button-premium text-white shadow-2xl rounded-full font-semibold border-2"
                  style={{
                    backgroundColor: "#283886",
                    borderColor: "#474EB8",
                  }}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Find Photographers
                </Button>
              </Link>
              <Link href="/signup?role=photographer">
                <Button
                  size="lg"
                  className="text-lg px-12 py-7 button-premium text-white shadow-2xl rounded-full font-semibold border-2"
                  style={{
                    backgroundColor: "#283886",
                    borderColor: "#474EB8",
                  }}
                >
                  <Camera className="mr-3 h-5 w-5" />
                  Join as Photographer
                </Button>
              </Link>
            </div>
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

      {/* Footer */}
      <PremiumFooter />
    </div>
  )
}
