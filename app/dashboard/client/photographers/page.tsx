"use client"

import { useEffect, useMemo, useState } from "react"
import { PhotographerCard } from "@/components/photographer-card"
import { Api } from "@/lib/api"
import { useToggleFavorite } from "@/lib/hooks"

export default function PhotographersPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const toggleFavMutation = useToggleFavorite()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const fetchPhotographers = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await Api.get<{ items: any[]; meta: any }>(`/photographers`)
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
  }, [])

  const mappedPhotographers = useMemo(() => {
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
    }))
  }, [items])

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

      {/* Filters removed */}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Photographers Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : mappedPhotographers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappedPhotographers.map((photographer) => (
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
            <p className="text-muted-foreground mb-4">Please check back later for more photographers</p>
          </div>
        </div>
      )}
    </div>
  )
}
