"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Camera, Heart } from "lucide-react"
interface PhotographerCardModel {
  id: string
  name: string
  avatar?: string
  state?: string
  serviceType?: string
  bio?: string
  portfolio: string[]
  rating: number
  reviewCount: number
  specialties: string[]
  priceRange?: string
  availability?: boolean
}

interface PhotographerCardProps {
  photographer: PhotographerCardModel
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}

export function PhotographerCard({ photographer, isFavorite = false, onToggleFavorite }: PhotographerCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-card card-hover animate-fade-in-up">
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
          {photographer.portfolio[0] && (
            <img
              src={photographer.portfolio[0] || "/portfolio-1.png"}
              alt={`${photographer.name} portfolio`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge
              variant={photographer.availability ? "default" : "secondary"}
              className={`${photographer.availability ? "bg-primary text-primary-foreground animate-pulse" : "bg-secondary"} backdrop-blur-sm`}
            >
              {photographer.availability ? "Available" : "Busy"}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-background/90 hover:bg-background/95 backdrop-blur-sm transition-all duration-300 hover:scale-110"
              onClick={() => onToggleFavorite?.(photographer.id)}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500 animate-pulse" : "text-muted-foreground hover:text-red-400"}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/20 animate-glow">
            <AvatarImage src={photographer.avatar || "/professional-algerian-businessman-headshot.png"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {photographer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl truncate mb-1">{photographer.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{photographer.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-semibold">{photographer.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({photographer.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground font-medium">{photographer.serviceType}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{photographer.bio}</p>
          <div className="flex flex-wrap gap-2">
            {photographer.specialties.slice(0, 2).map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                {specialty}
              </Badge>
            ))}
            {photographer.specialties.length > 2 && (
              <Badge variant="outline" className="text-xs bg-accent/5 border-accent/20 text-accent">
                +{photographer.specialties.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Starting from </span>
            <span className="font-bold text-lg text-primary">{photographer.priceRange}</span>
          </div>
          <Link href={`/dashboard/client/photographers/${photographer.id}`}>
            <Button
              size="sm"
              className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 button-premium"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
