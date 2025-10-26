import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PremiumNavbar } from "@/components/premium-navbar"
import { PremiumFooter } from "@/components/premium-footer"
import { CheckCircle2, Users, Zap, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[60vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0">
          <img src="/hero-studio.jpg" alt="About Sawerni" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-6xl md:text-7xl text-balance mb-6 leading-tight text-white font-normal"
              style={{ fontFamily: "var(--font-adlam-display)" }}
            >
              About SAWERNI
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto text-balance leading-relaxed">
              Revolutionizing photography in Algeria by connecting talented photographers with clients who value
              artistry and professionalism.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk mb-6 text-white">Our Mission</h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                  At Sawerni, we believe every moment deserves to be captured with artistry and care. Our mission is to
                  bridge the gap between professional photographers and clients across Algeria, making it easy to find
                  the perfect photographer for any occasion.
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  We're committed to supporting photographers in growing their businesses while providing clients with
                  access to exceptional talent and service.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Zap className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">Fast & Easy</h3>
                      <p className="text-white/70">Book photographers in just a few clicks</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Users className="h-8 w-8 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">Community Focused</h3>
                      <p className="text-white/70">Supporting Algerian photographers and creators</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Heart className="h-8 w-8 text-pink-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">Quality First</h3>
                      <p className="text-white/70">Only the best photographers on our platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk mb-6 text-white">Our Values</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              These principles guide everything we do at Sawerni
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Excellence",
                description: "We maintain the highest standards in every interaction and service",
              },
              {
                title: "Transparency",
                description: "Clear pricing, honest communication, and no hidden fees",
              },
              {
                title: "Innovation",
                description: "Continuously improving our platform to serve you better",
              },
              {
                title: "Trust",
                description: "Building lasting relationships with photographers and clients",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <CheckCircle2 className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="font-bold text-white mb-3 text-lg">{value.title}</h3>
                <p className="text-white/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#2F3D7F] via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk mb-6 text-white">
              Join the Sawerni Community
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Whether you're a photographer looking to grow your business or a client seeking exceptional photography,
              Sawerni is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 button-premium text-white shadow-2xl rounded-full font-semibold border-2"
                  style={{
                    backgroundColor: "#283886",
                    borderColor: "#474EB8",
                  }}
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all text-white rounded-full bg-transparent"
                >
                  Contact Us
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
