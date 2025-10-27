"use client"

import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, MapPin, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface FavoriteItem {
  id: string
  favoritedAt: string
  photographer: {
    id: string
    bio?: string
    priceBaseline?: number
    verified: boolean
    tags?: string[]
    ratingAvg?: number
    ratingCount?: number
    user: {
      id: string
      name: string
      email: string
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
}

interface FavoritesResponse {
  items: FavoriteItem[]
  meta: {
    total: number
    page: number
    perPage: number
    pages: number
  }
}

export default function FavoritesPage() {
  const queryClient = useQueryClient()

  // Fetch favorites using the correct API endpoint
  const { data, isLoading, error } = useQuery<FavoritesResponse>({
    queryKey: ["favorites"],
    queryFn: () => Api.get("/favorites?page=1&perPage=12"),
  })

  // Remove favorite mutation
  const removeFavorite = useMutation({
    mutationFn: (photographerId: string) => Api.delete(`/favorites/${photographerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      toast.success("Removed from favorites")
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove favorite")
    },
  })

  const formatPrice = (cents?: number) => {
    if (!cents) return "N/A"
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">
            {data?.meta?.total 
              ? `${data.meta.total} favorited photographer${data.meta.total !== 1 ? 's' : ''}`
              : "Your favorited photographers"}
          </p>
        </div>
        <Link href="/dashboard/client/photographers">
          <Button variant="outline">Find more</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <p className="text-sm text-red-600">
              {(error as any)?.message || "Failed to load favorites"}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.items || []).length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground opacity-60" />
                  <h3 className="text-lg font-semibold">No favorites yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover and add photographers to your favorites to easily access them later.
                  </p>
                  <Link href="/dashboard/client/photographers">
                    <Button className="mt-2">Browse Photographers</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            data.items.map((fav) => {
              const p = fav.photographer
              const coverImage = p.portfolios?.[0]?.images?.[0]?.url

              return (
                <Card key={fav.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {coverImage && (
                    <div className="h-40 overflow-hidden bg-muted">
                      <img 
                        src={coverImage} 
                        alt={p.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {p.user.name}
                      </CardTitle>
                      {p.verified && (
                        <Badge variant="secondary" className="shrink-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {p.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{p.state?.name || "Unknown"}</span>
                        </div>
                        
                        {(p.ratingAvg !== null && p.ratingAvg !== undefined) && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {p.ratingAvg.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">
                              ({p.ratingCount || 0})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {p.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {p.bio}
                      </p>
                    )}

                    {p.services && p.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.services.slice(0, 3).map((service) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                        {p.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{p.services.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {p.priceBaseline && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">From</span>
                        <span className="font-semibold">
                          {formatPrice(p.priceBaseline)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link 
                        href={`/dashboard/client/photographers/${p.id}`} 
                        className="flex-1"
                      >
                        <Button className="w-full" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite.mutate(p.id)}
                        disabled={removeFavorite.isPending}
                        className="shrink-0"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}