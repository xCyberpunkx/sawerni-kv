import { Card, CardContent } from "@/components/ui/card"

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden" id="how-it-works">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/how-it-works-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2
            className="text-5xl md:text-6xl font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-adlam-display)" }}
          >
            How it{" "}
            <span className="relative inline-block">
              Works
              <img
                src="/marker-underline.png"
                alt="marker"
                className="absolute left-0 w-full h-10"
                style={{ top: "calc(100% + 8px)" }}
              />
            </span>{" "}
            ?
          </h2>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center text-white mb-8 font-space-grotesk">Photographer Side</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">1.</span>
                  <span className="text-xl font-bold text-white ml-2">Sign Up</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Create your profile and showcase your best work.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">2.</span>
                  <span className="text-xl font-bold text-white ml-2">Get Bookings</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Clients discover your services and book directly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">3.</span>
                  <span className="text-xl font-bold text-white ml-2">Grow Your Business</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Gain visibility, manage clients, and increase income.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-center text-white mb-8 font-space-grotesk">Client Side</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">1.</span>
                  <span className="text-xl font-bold text-white ml-2">Search</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Browse photographers by category (wedding, events, product, studio...).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">2.</span>
                  <span className="text-xl font-bold text-white ml-2">Book</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Select your favorite pack and confirm your reservation online.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">3.</span>
                  <span className="text-xl font-bold text-white ml-2">Capture & Enjoy</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Meet your photographer, get your photos, and relive the moment!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
