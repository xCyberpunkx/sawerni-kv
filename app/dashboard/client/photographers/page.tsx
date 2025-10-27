"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PhotographerCard } from "@/components/photographer-card"
import { Api } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Photographer {
  id: string
  bio?: string
  priceBaseline?: number
  verified: boolean
  tags?: string[]
  ratingAvg?: number
  ratingCount?: number
  isFavorited?: boolean
  user: {
    id: string
    name: string
    email?: string
  }
  services: Array<{
    id: string
    name: string
    slug: string
  }>
  state: {
    id: string
    name: string
    code: string
  }
  portfolios: Array<{
    id: string
    title: string
    images?: Array<{
      id: string
      url: string
    }>
  }>
}

interface PhotographersResponse {
  items: Photographer[]
  meta: {
    total: number
    page: number
    perPage: number
    pages: number
  }
}

interface State {
  id: string
  name: string
  code: string
}

export default function PhotographersPage() {
  const queryClient = useQueryClient()
  const [selectedStateId, setSelectedStateId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>("")

  // Fetch photographers with search params
  const { data, isLoading, error } = useQuery<PhotographersResponse>({
    queryKey: ["photographers", selectedStateId, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (selectedStateId) params.set("stateId", selectedStateId)
      params.set("page", "1")
      params.set("perPage", "50")
      
      const url = params.toString() ? `/photographers?${params.toString()}` : "/photographers"
      return Api.get<PhotographersResponse>(url)
    },
  })

  // Fetch states for filter
  const { data: statesData } = useQuery<{ items: State[] }>({
    queryKey: ["states"],
    queryFn: () => Api.get("/states?page=1&perPage=100"),
  })

  // Add favorite mutation
  const addFavorite = useMutation({
    mutationFn: (photographerId: string) => Api.post(`/favorites/${photographerId}`),
    onSuccess: (_, photographerId) => {
      queryClient.invalidateQueries({ queryKey: ["photographers"] })
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      toast.success("Added to favorites")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add favorite")
    },
  })

  // Remove favorite mutation
  const removeFavorite = useMutation({
    mutationFn: (photographerId: string) => Api.delete(`/favorites/${photographerId}`),
    onSuccess: (_, photographerId) => {
      queryClient.invalidateQueries({ queryKey: ["photographers"] })
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      toast.success("Removed from favorites")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove favorite")
    },
  })

  // Extract available tags from photographers
  const availableTags = useMemo(() => {
    const allTags = new Set<string>()
    data?.items?.forEach((photographer) => {
      if (photographer.tags) {
        photographer.tags.forEach((tag) => allTags.add(tag))
      }
    })
    return Array.from(allTags)
  }, [data?.items])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearAllFilters = () => {
    setSelectedStateId("")
    setSearch("")
    setSelectedTags([])
    setPriceRange("")
  }

  // Apply client-side filters (tags and price range)
  const filteredPhotographers = useMemo(() => {
    let filtered = data?.items || []

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) =>
        p.tags && selectedTags.some((tag) => p.tags!.includes(tag))
      )
    }

    // Filter by price range
    if (priceRange) {
      filtered = filtered.filter((p) => {
        if (!p.priceBaseline) return false

        const price = p.priceBaseline / 100 // Convert cents to DA
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

    return filtered
  }, [data?.items, selectedTags, priceRange])

  // Map to photographer card format
  const mappedPhotographers = useMemo(() => {
    return filteredPhotographers.map((p) => ({
      id: p.id,
      name: p.user?.name || "",
      avatar: undefined, // Add avatarUrl to API response if available
      state: p.state?.name,
      serviceType: p.services?.[0]?.name,
      bio: p.bio,
      portfolio: p.portfolios?.[0]?.images?.map((img) => img.url) || [],
      rating: p.ratingAvg ?? 0,
      reviewCount: p.ratingCount ?? 0,
      specialties: p.tags || [],
      priceRange: p.priceBaseline ? `${Math.round(p.priceBaseline / 100)} DA+` : "",
      availability: true,
      priceBaseline: p.priceBaseline,
      verified: p.verified,
      isFavorited: p.isFavorited,
    }))
  }, [filteredPhotographers])

  const toggleFavorite = async (photographerId: string, isFavorited: boolean) => {
    if (isFavorited) {
      await removeFavorite.mutateAsync(photographerId)
    } else {
      await addFavorite.mutateAsync(photographerId)
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
                {statesData?.items?.map((s) => (
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
          <div className="grid gap-2">
            <Label htmlFor="price-range">Price Range</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger id="price-range">
                <SelectValue placeholder="All prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All prices</SelectItem>
                <SelectItem value="budget">Budget (&lt; 10,000 DA)</SelectItem>
                <SelectItem value="medium">Medium (10,000 - 25,000 DA)</SelectItem>
                <SelectItem value="premium">Premium (&gt; 25,000 DA)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && " ✓"}
              </Badge>
            ))}
            {availableTags.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">No specialties available</p>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || priceRange) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button onClick={() => toggleTag(tag)} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
            {priceRange && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {priceRange === "budget" && "Budget"}
                {priceRange === "medium" && "Medium"}
                {priceRange === "premium" && "Premium"}
                <button onClick={() => setPriceRange("")} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          {(error as any)?.message || "Failed to load photographers"}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && mappedPhotographers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {mappedPhotographers.length} photographer{mappedPhotographers.length !== 1 ? "s" : ""}
          {hasActiveFilters && " (filtered)"}
        </div>
      )}

      {/* Photographers Grid */}
      {isLoading ? (
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
              isFavorite={photographer.isFavorited || false}
              onToggleFavorite={(id) => toggleFavorite(id, photographer.isFavorited || false)}
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
                : "Please check back later for more photographers"}
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