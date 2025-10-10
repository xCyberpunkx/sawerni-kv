"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function WhereFindUsSection() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  const cities = [
    { name: "Oran", x: "25%", y: "30%", photographers: 50 },
    { name: "Algiers", x: "45%", y: "25%", photographers: 120 },
    { name: "Constantine", x: "70%", y: "28%", photographers: 80 },
  ]

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#2A3875] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto relative">
          {/* Map Container */}
          <div className="relative w-full aspect-[4/3] bg-[#1A1A2E] rounded-3xl shadow-2xl overflow-hidden p-8">
            {/* Map Image */}
            <div className="relative w-full h-full">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FINDUS-ERf0FWcKDkQQVm9jyIjOmKj5NWBQN3.png"
                alt="Algeria Map"
                className="w-full h-full object-contain"
              />

              {/* City Pins */}
              {cities.map((city) => (
                <div
                  key={city.name}
                  className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
                  style={{ left: city.x, top: city.y }}
                  onMouseEnter={() => setHoveredCity(city.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  <MapPin className="w-10 h-10 text-[#4A9EFF] animate-pulse-pin drop-shadow-lg" fill="#4A9EFF" />

                  {/* City Info Popup */}
                  {hoveredCity === city.name && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 animate-fade-in-up">
                      <div className="bg-white rounded-xl shadow-2xl p-6 min-w-[250px]">
                        <h3 className="text-2xl font-bold text-[#2F3D7F] mb-2">{city.name}</h3>
                        <p className="text-[#2F3D7F] mb-4">+{city.photographers} PHOTOGRAPHERS</p>
                        <Button
                          size="sm"
                          className="w-full bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white rounded-full font-semibold"
                        >
                          Explore
                        </Button>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile City List */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 md:hidden">
            {cities.map((city) => (
              <div key={city.name} className="bg-[#1A1A2E] rounded-xl p-6 text-center">
                <MapPin className="w-8 h-8 text-[#4A9EFF] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">{city.name}</h3>
                <p className="text-white/80 mb-4">+{city.photographers} photographers</p>
                <Button
                  size="sm"
                  className="w-full bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white rounded-full font-semibold"
                >
                  Explore
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
