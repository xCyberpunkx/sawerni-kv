"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Star, Calendar, ChevronDown } from "lucide-react"
import { Api } from "@/lib/api"
import { useToggleFavorite } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export function DiscoverPhotographersSection() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [photographers, setPhotographers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const toggleFavMutation = useToggleFavorite()

  const fetchPhotographers = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    setError("")
    try {
      const data = await Api.get<{ items: any[]; meta: any }>(`/photographers?page=${page}&perPage=3`)
      
      if (append) {
        setPhotographers(prev => [...prev, ...(data.items || [])])
      } else {
        setPhotographers(data.items || [])
      }
      
      // Check if there are more pages
      if (data.meta && data.meta.totalPages) {
        setHasMore(page < data.meta.totalPages)
      } else {
        // Fallback: if we get less than requested items, assume no more
        setHasMore((data.items || []).length === 3)
      }
      
      setCurrentPage(page)
    } catch (e: any) {
      setError(e?.message || "Failed to load photographers")
      console.error("Failed to fetch photographers:", e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPhotographers(1, false)
  }, [])

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPhotographers(currentPage + 1, true)
    }
  }

  const toggleFavorite = async (id: string) => {
    const newFavorites = new Set(favorites)
    const isFav = newFavorites.has(id)
    
    if (isFav) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)

    try {
      await toggleFavMutation.mutateAsync({ photographerId: id, isFav })
    } catch {
      // Revert on error
      const reverted = new Set(favorites)
      setFavorites(reverted)
    }
  }

  const mappedPhotographers = photographers.map((p: any) => ({
    id: p.id,
    name: p.user?.name || "Photographer",
    location: p.state?.name ? `${p.state.name}, Algérie` : "Algérie",
    experience: Math.floor(Math.random() * 10) + 1, // Fallback since API might not have this
    rating: p.ratingAvg ?? 4.5,
    reviews: p.ratingCount ?? 0,
    price: p.priceBaseline ? Math.round(p.priceBaseline / 100) : 5000,
    categories: p.tags || ["Photography", "Portraits"],
    image: p.portfolios?.[0]?.images?.[0]?.url || "/placeholder.svg",
  }))

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
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[...Array(3)].map((_, index) => (
              <Card
                key={index}
                className="bg-[#1A1A2E] border-0 shadow-2xl overflow-hidden card-hover"
              >
                <CardContent className="p-0">
                  {/* Image Skeleton */}
                  <div className="relative h-48 overflow-hidden bg-gray-700">
                    <Skeleton className="w-full h-full" />
                  </div>

                  {/* Content Skeleton */}
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-4 w-4" />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>

                    <Skeleton className="h-5 w-40 mb-4" />

                    <div className="flex justify-between">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-white py-8">
            <p>Failed to load photographers. Please try again later.</p>
            <Button 
              onClick={() => fetchPhotographers(1, false)}
              className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {mappedPhotographers.map((photographer, index) => (
                <Card
                  key={`${photographer.id}-${index}`}
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
                          {photographer.categories.slice(0, 3).map((category: string) => (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading More Skeletons */}
            {loadingMore && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-8">
                {[...Array(3)].map((_, index) => (
                  <Card
                    key={`loading-${index}`}
                    className="bg-[#1A1A2E] border-0 shadow-2xl overflow-hidden card-hover"
                  >
                    <CardContent className="p-0">
                      {/* Image Skeleton */}
                      <div className="relative h-48 overflow-hidden bg-gray-700">
                        <Skeleton className="w-full h-full" />
                      </div>

                      {/* Content Skeleton */}
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-32" />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <Skeleton key={i} className="h-4 w-4" />
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <Skeleton className="h-4 w-16 mb-2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                        </div>

                        <Skeleton className="h-5 w-40 mb-4" />

                        <div className="flex justify-between">
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                "Load More Photographers"
              )}
            </Button>
          </div>
        )}

        {/* No More Results */}
        {!loading && !hasMore && photographers.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-white/60">No more photographers to load</p>
          </div>
        )}
      </div>
    </section>
  )
}