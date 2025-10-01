"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PackageForm } from "@/components/package-form"
import { Edit, Trash2, Eye, Plus, CheckCircle } from "lucide-react"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import type { PackageModel } from "@/components/package-form"

export default function PackagesPage() {
  const user = mockAuth.getCurrentUser()
  const [packages, setPackages] = useState<PackageModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadPackages = async () => {
    setLoading(true)
    setError("")
    try {
      if (!user) return
      const me = await Api.get<any>("/auth/me")
      const photographerId = me?.photographer?.id
      if (!photographerId) return setPackages([])
      const res = await Api.get<PackageModel[]>(`/packages/photographer/${photographerId}`)
      const mapped = (res as any[]).map((p) => ({
        id: p.id,
        name: p.title,
        description: p.description,
        price: p.priceCents / 100,
        duration: "",
        includes: [],
      }))
      setPackages(mapped)
    } catch (e: any) {
      setError(e?.message || "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSavePackage = async (packageData: Omit<PackageModel, "id">) => {
    try {
      const me = await Api.get<any>("/auth/me")
      const payload = {
        title: packageData.name,
        description: packageData.description,
        priceCents: Math.round(packageData.price * 100),
      }
      const created = await Api.post<any>("/packages", payload)
      setPackages((prev) => [
        ...prev,
        { id: created.id, name: created.title, description: created.description, price: created.priceCents / 100, duration: "", includes: [] },
      ])
    } catch (e) {
      // noop minimal UI
    }
  }

  const handleUpdatePackage = async (packageId: string, packageData: Omit<PackageModel, "id">) => {
    try {
      const payload = {
        title: packageData.name,
        description: packageData.description,
        priceCents: Math.round(packageData.price * 100),
      }
      const updated = await Api.put<any>(`/packages/${packageId}`, payload)
      setPackages((prev) => prev.map((pkg) => (pkg.id === packageId ? { id: updated.id, name: updated.title, description: updated.description, price: updated.priceCents / 100, duration: "", includes: [] } : pkg)))
    } catch (e) {}
  }

  const handleDeletePackage = async (packageId: string) => {
    try {
      await Api.delete(`/packages/${packageId}`)
      setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId))
    } catch (e) {}
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage packages</h1>
          <p className="text-muted-foreground">Add and edit your photography packages</p>
        </div>
        <PackageForm onSave={handleSavePackage} onCancel={() => {}} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{packages.length}</p>
                <p className="text-sm text-muted-foreground">Total packages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{packages.length}</p>
                <p className="text-sm text-muted-foreground">Active packages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Package views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Grid */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{pkg.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {pkg.duration}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <PackageForm
                      package={pkg}
                      onSave={(data) => handleUpdatePackage(pkg.id, data)}
                      onCancel={() => {}}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>

                <div className="text-2xl font-bold text-primary">{pkg.price.toLocaleString()} DA</div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Package includes:</p>
                  <div className="space-y-1">
                    {pkg.includes.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                    {pkg.includes.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{pkg.includes.length - 3} more items</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bookings:</span>
                    <span className="font-medium">12 bookings</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-medium">89 views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No packages yet</h3>
              <p className="text-muted-foreground mb-6">Start adding your photography packages to attract more clients</p>
              <PackageForm onSave={handleSavePackage} onCancel={() => {}} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
