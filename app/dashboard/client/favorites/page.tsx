"use client"

import Link from "next/link"
import { useFavorites, useToggleFavorite } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Heart, MapPin } from "lucide-react"

export default function FavoritesPage() {
  const { data, isLoading, error } = useFavorites()
  const toggleFav = useToggleFavorite()

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">Your favorited photographers</p>
        </div>
        <Link href="/dashboard/client/photographers">
          <Button variant="outline">Find more</Button>
        </Link>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div className="text-sm text-red-600">{(error as any)?.message || "Failed to load"}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data?.items || []).map((fav: any) => {
          const p = fav.photographer
          return (
            <Card key={fav.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{p.user?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={p.user?.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>{(p.user?.name || "").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{p.state?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{p.ratingAvg ?? 0}</span>
                      <span className="text-muted-foreground">({p.ratingCount ?? 0})</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/client/photographers/${p.id}`} className="flex-1">
                    <Button className="w-full">View</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => toggleFav.mutate({ photographerId: p.id, isFav: true })}
                    disabled={toggleFav.isPending}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


