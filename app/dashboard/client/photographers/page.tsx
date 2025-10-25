"use client"

import { useEffect, useMemo, useState } from "react"
import { PhotographerCard } from "@/components/photographer-card"
import { Api } from "@/lib/api"
import { useToggleFavorite } from "@/lib/hooks"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PhotographersPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const toggleFavMutation = useToggleFavorite()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [states, setStates] = useState<Array<{ id: string; name: string }>>([])
  const [selectedStateId, setSelectedStateId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>("")

  const fetchPhotographers = async (stateId?: string, q?: string) => {
    setLoading(true)
    setError("")
    try {
      const endpoint = stateId ? `/photographers/state/${stateId}` : `/photographers`
      const qs = new URLSearchParams()
      if (q) qs.set("q", q)
      const url = qs.toString() ? `${endpoint}?${qs.toString()}` : endpoint
      const data = await Api.get<{ items: any[]; meta: any }>(url)
      setItems(data.items || [])
      
      // Extract unique tags from all photographers
      const allTags = new Set<string>()
      data.items?.forEach((photographer: any) => {
        if (photographer.tags) {
          photographer.tags.forEach((tag: string) => allTags.add(tag))
        }
      })
      setAvailableTags(Array.from(allTags))
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

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await Api.get<{ items: Array<{ id: string; name: string; code?: string }>; meta?: any }>(
          `/states?page=1&perPage=100`,
        )
        setStates((data.items || []).map((s) => ({ id: s.id, name: s.name })))
      } catch (e) {
        // Non-fatal: keep empty list
      }
    }
    fetchStates()
  }, [])

  useEffect(() => {
    if (selectedStateId) {
      fetchPhotographers(selectedStateId, search)
    } else {
      fetchPhotographers(undefined, search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateId, search])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearAllFilters = () => {
    setSelectedStateId("")
    setSearch("")
    setSelectedTags([])
    setPriceRange("")
  }

  const mappedPhotographers = useMemo(() => {
    let filtered = items

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((p: any) => 
        p.tags && selectedTags.some(tag => p.tags.includes(tag))
      )
    }

    // Filter by price range
    if (priceRange) {
      filtered = filtered.filter((p: any) => {
        if (!p.priceBaseline) return false
        
        const price = p.priceBaseline / 100 // Convert to DA
        switch (priceRange) {
          case "budget":
            return price < 10000
          case "medium":
            return price >= 10000 && price < 25000
          case "premium":
            return price >= 25000
          default:
            return true
        }
      })
    }

    return filtered.map((p: any) => ({
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
      priceBaseline: p.priceBaseline,
    }))
  }, [items, selectedTags, priceRange])

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

  const hasActiveFilters = selectedStateId || search || selectedTags.length > 0 || priceRange

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Photographers</h1>
        <p className="text-muted-foreground">Discover the best photographers in Algeria</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl">
          {/* State Filter */}
          <div className="grid gap-2">
            <Label htmlFor="state-select">Filter by state</Label>
            <Select
              value={selectedStateId}
              onValueChange={(value) => setSelectedStateId(value === "all" ? "" : value)}
            >
              <SelectTrigger id="state-select">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="grid gap-2">
            <Label htmlFor="search">Search</Label>
            <Input 
              id="search" 
              placeholder="Search by name" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          {/* Price Range Filter */}
          {/* <div className="grid gap-2">
            <Label htmlFor="price-range">Price range</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger id="price-range">
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any price</SelectItem>
                <SelectItem value="budget">Budget (under 10,000 DA)</SelectItem>
                <SelectItem value="medium">Medium (10,000 - 25,000 DA)</SelectItem>
                <SelectItem value="premium">Premium (25,000+ DA)</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearAllFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Tags Filter */}
        <div className="grid gap-2 max-w-6xl">
          <Label>Filter by specialties</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && " ✓"}
              </Badge>
            ))}
            {availableTags.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">No specialties available</p>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || priceRange) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button 
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            {priceRange && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {priceRange === "budget" && "Budget"}
                {priceRange === "medium" && "Medium"}
                {priceRange === "premium" && "Premium"}
                <button 
                  onClick={() => setPriceRange("")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Results Count */}
      {!loading && mappedPhotographers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {mappedPhotographers.length} photographer{mappedPhotographers.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtered)'}
        </div>
      )}

      {/* Photographers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
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
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? "No photographers match your filters" : "No photographers found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? "Try adjusting your filters to see more results" 
                : "Please check back later for more photographers"
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}