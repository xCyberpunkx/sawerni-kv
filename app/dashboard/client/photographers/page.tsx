"use client"

import { useEffect, useMemo, useState } from "react"
import { PhotographerCard } from "@/components/photographer-card"
import { PhotographerFilters, type FilterState } from "@/components/photographer-filters"
import { Api } from "@/lib/api"
import { useToggleFavorite } from "@/lib/hooks"

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
  const toggleFavMutation = useToggleFavorite()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const fetchPhotographers = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set("q", filters.search)
      if (filters.state) params.set("stateId", filters.state)
      if (filters.serviceType) params.set("serviceId", filters.serviceType)
      // rating and availability are client-side UI hints; backend supports sort and filters as per docs
      const data = await Api.get<{ items: any[]; meta: any }>(`/photographers?${params.toString()}`)
      setItems(data.items || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load photographers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotographers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.state, filters.serviceType])

  const filteredPhotographers = useMemo(() => {
    return items.map((p: any) => ({
      id: p.id,
      name: p.user?.name || "",
      avatar: p.user?.avatarUrl,
      state: p.state?.name,
      serviceType: p.services?.[0]?.name,
      bio: p.bio,
      portfolio: p.portfolios?.[0]?.images?.map((img: any) => img.url) || [],
      rating: p.ratingAvg ?? 0,
      reviewCount: p.ratingCount ?? 0,
      specialties: p.tags || [],
      priceRange: p.priceBaseline ? `${Math.round(p.priceBaseline / 100)}00 DA+` : "",
      availability: true,
    })).filter((photographer: any) => {
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
  }, [filters, items])

  const toggleFavorite = async (photographerId: string) => {
    const isFav = favorites.includes(photographerId)
    setFavorites((prev) => (isFav ? prev.filter((id) => id !== photographerId) : [...prev, photographerId]))
    try {
      await toggleFavMutation.mutateAsync({ photographerId, isFav })
    } catch {
      // revert on error
      setFavorites((prev) => (isFav ? [...prev, photographerId] : prev.filter((id) => id !== photographerId)))
    }
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

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Photographers Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : filteredPhotographers.length > 0 ? (
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
