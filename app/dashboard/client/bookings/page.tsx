"use client"

import Link from "next/link"
import { useBookings } from "@/lib/hooks"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, ArrowRight, MapPin, Clock, DollarSign, StickyNote } from "lucide-react"

const stateColor: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled_by_client: "bg-red-100 text-red-800",
  cancelled_by_photographer: "bg-red-100 text-red-800",
}

export default function BookingsPage() {
  const { data, isLoading, error } = useBookings(1, 50)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Your booking history and active sessions</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-9 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{(error as any)?.message || "Failed to load"}</div>}

      <div className="space-y-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="gap-2 flex flex-wrap">
            {[
              { value: "all", label: "All" },
              { value: "requested", label: "Requested" },
              { value: "confirmed", label: "Confirmed" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled_by_client", label: "Cancelled (You)" },
              { value: "cancelled_by_photographer", label: "Cancelled (Photographer)" },
            ].map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="capitalize">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {(() => {
          const all = (data?.items || [])
          const filtered = statusFilter === "all" ? all : all.filter((b: any) => b.state === statusFilter)
          if (!isLoading && !error && filtered.length === 0) {
            return (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="max-w-md mx-auto space-y-2">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-60" />
                    <h3 className="text-lg font-semibold">No bookings match this filter</h3>
                    <p className="text-sm text-muted-foreground">Try selecting a different status or book a new session.</p>
                    <Link href="/dashboard/client/photographers">
                      <Button className="mt-2">Find Photographers</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          }
          return null
        })()}

        {(data?.items || [])
          .filter((bk: any) => (statusFilter === "all" ? true : bk.state === statusFilter))
          .map((bk) => {
          const start = new Date(bk.startAt)
          const end = bk.endAt ? new Date(bk.endAt) : null
          const dateStr = start.toLocaleString()
          const durationHours = end ? Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60)) : null
          const priceDa = typeof bk.priceCents === "number" ? Math.round(bk.priceCents / 100) : null
          const color = stateColor[bk.state] || "bg-muted text-foreground"
          return (
            <Card key={bk.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {bk.photographer?.user?.name || "Photographer"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{dateStr}</div>
                  <Badge className={color}>{bk.state.replaceAll("_", " ")}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {durationHours != null ? `${durationHours.toFixed(1)}h` : "Time TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{bk.location?.address || "Location TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{priceDa != null ? `${priceDa.toLocaleString()} DA` : "Price TBD"}</span>
                  </div>
                  {bk.notes && (
                    <div className="flex items-center gap-2 text-muted-foreground md:col-span-1 md:justify-self-start">
                      <StickyNote className="h-4 w-4" />
                      <span className="truncate" title={bk.notes}>{bk.notes}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link href={`/dashboard/client/bookings/${bk.id}`}>
                    <Button variant="outline" className="gap-2">
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


