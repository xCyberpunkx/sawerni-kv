"use client"

import { useState, useMemo } from "react"
import { PhotographerCard } from "@/components/photographer-card"
import { PhotographerFilters, type FilterState } from "@/components/photographer-filters"
import { demoPhotographers } from "@/lib/demo-data"

export default function PhotographersPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    state: "",
    serviceType: "",
    priceRange: "",
    rating: "",
    availability: "",
  })
  const [favorites, setFavorites] = useState<string[]>([])

  const filteredPhotographers = useMemo(() => {
    return demoPhotographers.filter((photographer) => {
      // Search filter
      if (
        filters.search &&
        !photographer.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !photographer.bio?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // State filter
      if (filters.state && photographer.state !== filters.state) {
        return false
      }

      // Service type filter
      if (filters.serviceType && photographer.serviceType !== filters.serviceType) {
        return false
      }

      // Rating filter
      if (filters.rating && photographer.rating < Number.parseFloat(filters.rating)) {
        return false
      }

      // Availability filter
      if (filters.availability === "available" && !photographer.availability) {
        return false
      }
      if (filters.availability === "unavailable" && photographer.availability) {
        return false
      }

      // Price range filter (simplified - in real app would parse package prices)
      if (filters.priceRange) {
        // This is a simplified implementation
        // In a real app, you'd parse the actual package prices
        return true
      }

      return true
    })
  }, [filters])

  const toggleFavorite = (photographerId: string) => {
    setFavorites((prev) =>
      prev.includes(photographerId) ? prev.filter((id) => id !== photographerId) : [...prev, photographerId],
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Photographers</h1>
        <p className="text-muted-foreground">Discover the best photographers in Algeria</p>
      </div>

      {/* Filters */}
      <PhotographerFilters filters={filters} onFiltersChange={setFilters} resultsCount={filteredPhotographers.length} />

      {/* Photographers Grid */}
      {filteredPhotographers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotographers.map((photographer) => (
            <PhotographerCard
              key={photographer.id}
              photographer={photographer}
              isFavorite={favorites.includes(photographer.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📷</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No photographers found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria to find suitable photographers</p>
          </div>
        </div>
      )}
    </div>
  )
}
