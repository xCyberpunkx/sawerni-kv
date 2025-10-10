import { Card, CardContent } from "@/components/ui/card"

export function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#3A467C]" id="how-it-works">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/professional-photography-studio-with-lighting-equi.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk mb-2 text-white">
            How it{" "}
            <span className="relative inline-block">
              Works
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></span>
            </span>{" "}
            ?
          </h2>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center text-white mb-8 font-space-grotesk">Photographer Side</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Sign Up */}
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">1.</span>
                  <span className="text-xl font-bold text-white">Sign Up</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Create your profile and showcase your best work.
                </p>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">LOGIN</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Get Bookings */}
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">2.</span>
                  <span className="text-xl font-bold text-white">Get Bookings</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Clients discover your services and book directly.
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="30" fill="#4A90E2" />
                      <path
                        d="M32 16L38 28H26L32 16Z"
                        fill="#FFD93D"
                        stroke="#FFD93D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect x="20" y="28" width="24" height="16" rx="2" fill="white" />
                      <circle cx="26" cy="36" r="2" fill="#4A90E2" />
                      <circle cx="38" cy="36" r="2" fill="#4A90E2" />
                      <path d="M28 40H36" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Grow Your Business */}
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">3.</span>
                  <span className="text-xl font-bold text-white">Grow Your Business</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Gain visibility, manage clients, and increase income.
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="28" fill="#FF6B6B" />
                      <path
                        d="M20 40L28 28L36 36L44 24"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M38 24H44V30"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-center text-white mb-8 font-space-grotesk">Client Side</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Search */}
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">1.</span>
                  <span className="text-xl font-bold text-white">Search</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Browse photographers by category (wedding, events, product, studio...).
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="28" fill="#4A90E2" />
                      <circle cx="28" cy="28" r="8" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M34 34L42 42" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="40" cy="40" r="4" fill="#FF6B6B" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Book */}
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">2.</span>
                  <span className="text-xl font-bold text-white">Book</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Select your favorite pack and confirm your reservation online.
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <rect x="12" y="16" width="40" height="36" rx="4" fill="#4A90E2" />
                      <rect x="12" y="16" width="40" height="10" rx="4" fill="#2E5C8A" />
                      <rect x="18" y="30" width="10" height="8" rx="2" fill="white" />
                      <rect x="30" y="30" width="10" height="8" rx="2" fill="white" />
                      <rect x="42" y="30" width="4" height="8" rx="2" fill="#FFD93D" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Capture & Enjoy */}
            <Card className="bg-[#0A1128] border-0 shadow-2xl p-6 card-hover group rounded-2xl">
              <CardContent className="p-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">3.</span>
                  <span className="text-xl font-bold text-white">Capture & Enjoy</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Meet your photographer, get your photos, and relive the moment!
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                      <rect x="12" y="20" width="40" height="28" rx="4" fill="#FF6B6B" />
                      <circle cx="32" cy="34" r="8" stroke="white" strokeWidth="3" fill="none" />
                      <circle cx="44" cy="26" r="2" fill="white" />
                      <path d="M20 12L24 20H40L44 12" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
