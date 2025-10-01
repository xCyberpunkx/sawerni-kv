"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

const algerianStates = [
  "Algiers",
  "Oran",
  "Constantine",
  "Annaba",
  "Batna",
  "Setif",
  "Sidi Bel Abbes",
  "Biskra",
  "Tlemcen",
  "Bejaia",
  "Tizi Ouzou",
  "Ouargla",
  "Bechar",
  "M'sila",
  "Chlef",
]

const serviceTypes = [
  "Wedding photography",
  "Event photography",
  "Portrait photography",
  "Kids photography",
  "Commercial photography",
  "Nature photography",
  "Photojournalism",
  "Product photography",
]

const priceRanges = [
  { label: "Less than 20,000 DA", value: "0-20000" },
  { label: "20,000 - 50,000 DA", value: "20000-50000" },
  { label: "50,000 - 100,000 DA", value: "50000-100000" },
  { label: "More than 100,000 DA", value: "100000+" },
]

export interface FilterState {
  search: string
  state: string
  serviceType: string
  priceRange: string
  rating: string
  availability: string
}

interface PhotographerFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  resultsCount: number
}

export function PhotographerFilters({ filters, onFiltersChange, resultsCount }: PhotographerFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      state: "",
      serviceType: "",
      priceRange: "",
      rating: "",
      availability: "",
    })
  }

  const activeFiltersCount = Object.values(filters).filter((value) => value !== "").length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a photographer..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pr-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Found {resultsCount} photographers</p>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.state && (
            <Badge variant="secondary" className="gap-1">
              {filters.state}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("state", "")} />
            </Badge>
          )}
          {filters.serviceType && (
            <Badge variant="secondary" className="gap-1">
              {filters.serviceType}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("serviceType", "")} />
            </Badge>
          )}
          {filters.priceRange && (
            <Badge variant="secondary" className="gap-1">
              {priceRanges.find((r) => r.value === filters.priceRange)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("priceRange", "")} />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={filters.state} onValueChange={(value) => updateFilter("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {algerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Service type</Label>
                <Select value={filters.serviceType} onValueChange={(value) => updateFilter("serviceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All services</SelectItem>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price range</Label>
                <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All prices</SelectItem>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={filters.rating} onValueChange={(value) => updateFilter("rating", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ratings</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="4.0">4.0+ stars</SelectItem>
                    <SelectItem value="3.5">3.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={filters.availability} onValueChange={(value) => updateFilter("availability", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
