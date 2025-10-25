import { Card, CardContent } from "@/components/ui/card"

export function WhyChooseSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/why-choose-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2
            className="text-5xl md:text-6xl font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-adlam-display)" }}
          >
            Why choose{" "}
            <span className="relative inline-block">
              SAWERNI
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Card 1: Fast & easy */}
          <Card className="bg-[#1A1A2E] border-0 shadow-2xl p-8 card-hover">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">⚡</div>
                <h3 className="text-2xl font-bold text-white">Fast & easy</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">Book your photographer in just 3 clicks.</p>
            </CardContent>
          </Card>

          {/* Card 2: All-in-one */}
          <Card className="bg-[#1A1A2E] border-0 shadow-2xl p-8 card-hover">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">🎨</div>
                <h3 className="text-2xl font-bold text-white">All-in-one</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                Weddings, studio shoots, outdoor, events, products... we got it all
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Zero stress */}
          <Card className="bg-[#1A1A2E] border-0 shadow-2xl p-8 card-hover">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">😌</div>
                <h3 className="text-2xl font-bold text-white">Zero stress</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">We connect you, you enjoy the moment.</p>
            </CardContent>
          </Card>

          {/* Card 4: Quality guaranteed */}
          <Card className="bg-[#1A1A2E] border-0 shadow-2xl p-8 card-hover">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">🔥</div>
                <h3 className="text-2xl font-bold text-white">Quality guaranteed</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">We connect you, you enjoy the moment.</p>
            </CardContent>
          </Card>

          {/* Card 5: Fits every budget */}
          <Card className="bg-[#1A1A2E] border-0 shadow-2xl p-8 card-hover">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">💰</div>
                <h3 className="text-2xl font-bold text-white">Fits every budget</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                From basic to premium packs, you choose your vibe.
              </p>
            </CardContent>
          </Card>

          {/* Card 6: Made for you */}
          <Card className="bg-[#1A1A2E] border-0 shadow-2xl p-8 card-hover">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">💖</div>
                <h3 className="text-2xl font-bold text-white">Made for you</h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                Your personal client space with favorites + booking history.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-16">
          <p className="text-xl text-white/90 italic">With us, every moment turns into an unforgettable memory</p>
        </div>
      </div>
    </section>
  )
}
