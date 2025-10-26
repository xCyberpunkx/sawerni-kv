"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Star, Calendar, ChevronDown } from "lucide-react"

export function DiscoverPhotographersSection() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const photographers = [
    {
      id: 1,
      name: "studio's name",
      location: "Alger, Algérie",
      experience: 7,
      rating: 4.8,
      reviews: 120,
      price: 6000,
      categories: ["Weddings", "Studio shootings", "Products"],
      image: "/photography-studio-setup.jpg",
    },
    {
      id: 2,
      name: "studio's name",
      location: "Alger, Algérie",
      experience: 7,
      rating: 4.8,
      reviews: 120,
      price: 6000,
      categories: ["Weddings", "Studio shootings", "Products"],
      image: "/camera-equipment-studio.jpg",
    },
    {
      id: 3,
      name: "studio's name",
      location: "Blida, Algérie",
      experience: 7,
      rating: 4.8,
      reviews: 120,
      price: 6000,
      categories: ["Filming", "Freelancer", "Video editing"],
      image: "/video-production-equipment.jpg",
    },
  ]

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#2A3875] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk mb-4 text-white">
            Discover our <span className="heading-underline">Photographers</span>!
          </h2>
        </div>

        
        {/* Photographer Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {photographers.map((photographer, index) => (
            <Card
              key={photographer.id}
              className="bg-[#1A1A2E] border-0 shadow-2xl overflow-hidden card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={photographer.image || "/placeholder.svg"}
                    alt={photographer.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(photographer.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.has(photographer.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{photographer.name}</h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-white/80 mb-3">
                    <MapPin className="h-4 w-4 text-[#4A9EFF]" />
                    <span className="text-sm">{photographer.location}</span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-white/80 text-sm">Experience Level:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#FAF056] text-[#FAF056]" />
                      ))}
                      <span className="text-white/80 text-sm ml-1">({photographer.experience} years)</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <p className="text-white/80 text-sm mb-2">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {photographer.categories.map((category) => (
                        <span
                          key={category}
                          className="px-3 py-1 bg-[#2F3D7F] text-white text-xs rounded-full border border-white/10"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 fill-[#FAF056] text-[#FAF056]" />
                    <span className="text-white font-semibold">
                      {photographer.rating} / 5 ({photographer.reviews} reviews)
                    </span>
                  </div>

                  {/* Price and Book Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs">Services starting from</p>
                      <p className="text-white font-bold text-lg">{photographer.price} DA</p>
                    </div>
                    <Button className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white rounded-full px-8 font-semibold">
                      BOOK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-12"
          >
            Load More Photographers
          </Button>
        </div>
      </div>
    </section>
  )
}
