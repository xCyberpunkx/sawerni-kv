"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Api, apiFetch } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { Plus, Pencil, Trash2, Camera, Clock, Users, DollarSign, Calendar, Star, AlertCircle, Loader2, Package, TrendingUp } from "lucide-react"

interface PackageDto {
  id: string
  photographerId: string
  title: string
  description?: string
  imageUrls?: string[]
  priceCents: number
  durationMinutes?: number
  category?: string
  includes?: string[]
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

interface UpsertPackageDto {
  title: string
  description?: string
  imageUrls?: string[]
  priceCents: number
  durationMinutes?: number
  category?: string
  includes?: string[]
  isActive?: boolean
}

export default function PhotographerPackagesPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [items, setItems] = useState<PackageDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UpsertPackageDto>({
    title: "",
    description: "",
    imageUrls: [],
    priceCents: 0,
    durationMinutes: 60,
    category: "portrait",
    includes: [],
    isActive: true
  })
  const [newImageUrl, setNewImageUrl] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newInclude, setNewInclude] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<PackageDto | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const me = await Api.get<any>("/auth/me");
        console.log(me); // This should now include photographer data
        const pid = me?.photographer?.id as string | undefined;
        if (!pid) return;
        setPhotographerId(pid);
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      }
    };
    run();
  }, [user]);

  const load = async () => {
    if (!photographerId) return
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<PackageDto[]>(`/packages/photographer/${photographerId}`)
      setItems(res || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      title: "",
      description: "",
      imageUrls: [],
      priceCents: 0,
      durationMinutes: 60,
      category: "portrait",
      includes: [],
      isActive: true
    })
    setNewInclude("")
    setNewImageUrl("")
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (pkg: PackageDto) => {
    setEditingId(pkg.id)
    setForm({
      title: pkg.title,
      description: pkg.description || "",
      imageUrls: pkg.imageUrls || [],
      priceCents: pkg.priceCents,
      durationMinutes: pkg.durationMinutes || 60,
      category: pkg.category || "portrait",
      includes: pkg.includes || [],
      isActive: pkg.isActive ?? true
    })
    setIsDialogOpen(true)
  }

  const openDeleteConfirm = (pkg: PackageDto) => {
    setPackageToDelete(pkg)
    setDeleteConfirmOpen(true)
  }

  const addInclude = () => {
    if (newInclude.trim() && !form.includes?.includes(newInclude.trim())) {
      setForm(prev => ({
        ...prev,
        includes: [...(prev.includes || []), newInclude.trim()]
      }))
      setNewInclude("")
    }
  }

  const addImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    if (!form.imageUrls) setForm((f) => ({ ...f, imageUrls: [url] }))
    else if (!form.imageUrls.includes(url)) setForm((f) => ({ ...f, imageUrls: [...f.imageUrls!, url] }))
    setNewImageUrl("")
  }

  const removeImageUrl = (url: string) => {
    setForm(prev => ({ ...prev, imageUrls: prev.imageUrls?.filter(u => u !== url) || [] }))
  }

  const uploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      Array.from(selectedFiles).forEach((f) => fd.append("files", f))

      // Assumes backend exposes a multipart upload endpoint at /uploads
      const res = await apiFetch<any>("/uploads", { method: "POST", body: fd, multipart: true })

      let urls: string[] = []
      if (Array.isArray(res)) urls = res
      else if (res.urls && Array.isArray(res.urls)) urls = res.urls
      else if (res.url && typeof res.url === "string") urls = [res.url]

      if (urls.length > 0) {
        setForm((prev) => ({ ...prev, imageUrls: [...(prev.imageUrls || []), ...urls] }))
      } else {
        throw new Error("Upload succeeded but no URLs were returned")
      }

      // clear selection
      setSelectedFiles(null)
    } catch (e: any) {
      setError(e?.message || "Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const removeInclude = (item: string) => {
    setForm(prev => ({
      ...prev,
      includes: prev.includes?.filter(i => i !== item) || []
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || form.priceCents < 0) {
      setError("Title is required and price must be positive")
      return
    }

    if (form.durationMinutes && form.durationMinutes <= 0) {
      setError("Duration must be positive")
      return
    }

    setSaving(true)
    setError("")
    try {
      if (editingId) {
        // optimistic update
        const prev = items
        setItems((old) => old.map((it) => (it.id === editingId ? { ...it, ...form, updatedAt: new Date().toISOString() } as PackageDto : it)))
        try {
          const updated = await Api.put<PackageDto>(`/packages/${editingId}`, form)
          setItems((old) => old.map((it) => (it.id === editingId ? updated : it)))
        } catch (e: any) {
          setItems(prev)
          throw e
        }
      } else {
        // create optimistic entry with temp id
        const tempId = `temp_${Date.now()}`
        const optimistic: PackageDto = {
          id: tempId,
          photographerId: photographerId as string,
          title: form.title,
          description: form.description,
          imageUrls: form.imageUrls,
          priceCents: form.priceCents,
          durationMinutes: form.durationMinutes,
          category: form.category,
          includes: form.includes,
          isActive: form.isActive,
          createdAt: new Date().toISOString(),
        }
        setItems((old) => [optimistic, ...old])
        try {
          const created = await Api.post<PackageDto>("/packages", form)
          setItems((old) => old.map((it) => (it.id === tempId ? created : it)))
        } catch (e: any) {
          setItems((old) => old.filter((it) => it.id !== tempId))
          throw e
        }
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (e: any) {
      const message = e?.details?.issues?.[0]?.message || e?.message || "Failed to save package"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!packageToDelete) return

    const prev = items
    setItems((old) => old.filter((it) => it.id !== id))
    setDeleteConfirmOpen(false)
    setPackageToDelete(null)

    try {
      await Api.delete(`/packages/${id}`)
    } catch (e: any) {
      setItems(prev)
      setError(e?.message || "Failed to delete package")
    }
  }

  const togglePackageStatus = async (pkg: PackageDto) => {
    const prev = items
    setItems((old) => old.map((it) =>
      it.id === pkg.id ? { ...it, isActive: !it.isActive } : it
    ))

    try {
      await Api.put<PackageDto>(`/packages/${pkg.id}`, {
        ...pkg,
        isActive: !pkg.isActive
      })
    } catch (e: any) {
      setItems(prev)
      setError(e?.message || "Failed to update package status")
    }
  }

  const totalPackages = useMemo(() => items.length, [items])
  const activePackages = useMemo(() => items.filter(pkg => pkg.isActive !== false).length, [items])
  const totalValue = useMemo(() => items.reduce((sum, pkg) => sum + pkg.priceCents, 0) / 100, [items])
  const averagePrice = useMemo(() => {
    if (items.length === 0) return 0
    return (items.reduce((sum, pkg) => sum + pkg.priceCents, 0) / items.length) / 100
  }, [items])

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "portrait": return "👤"
      case "wedding": return "💍"
      case "event": return "🎉"
      case "commercial": return "💼"
      case "landscape": return "🌄"
      case "product": return "📦"
      default: return "📷"
    }
  }

  const getCategoryName = (category?: string) => {
    switch (category) {
      case "portrait": return "Portrait"
      case "wedding": return "Wedding"
      case "event": return "Event"
      case "commercial": return "Commercial"
      case "landscape": return "Landscape"
      case "product": return "Product"
      default: return "General"
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Flexible"
    if (minutes < 60) return `${minutes} min`
    if (minutes === 60) return "1 hour"
    const hours = minutes / 60
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Authentication required</h3>
          <p className="text-muted-foreground">Please log in to manage your packages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Packages</h1>
          <p className="text-muted-foreground">Create and manage your photography service packages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Package" : "Create New Package"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update your package details" : "Add a new service package to your offerings"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Package Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Basic Portrait Session"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceCents">Price (DA) *</Label>
                  <Input
                    id="priceCents"
                    type="number"
                    min="0"
                    value={form.priceCents}
                    onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
                    placeholder="15000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    min="0"
                    value={form.durationMinutes}
                    onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                    placeholder="60 (minutes)"
                  />
                  <p className="text-xs text-muted-foreground">Duration in minutes (60 = 1 hour)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">👤 Portrait</SelectItem>
                      <SelectItem value="wedding">💍 Wedding</SelectItem>
                      <SelectItem value="event">🎉 Event</SelectItem>
                      <SelectItem value="commercial">💼 Commercial</SelectItem>
                      <SelectItem value="landscape">🌄 Landscape</SelectItem>
                      <SelectItem value="product">📦 Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what clients can expect from this package..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>What's Included</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newInclude}
                      onChange={(e) => setNewInclude(e.target.value)}
                      placeholder="Add included item (e.g., 10 edited photos)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                    />
                    <Button type="button" onClick={addInclude} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="text-sm"
                    />
                    <Button type="button" onClick={uploadFiles} disabled={uploading || !selectedFiles || selectedFiles.length === 0} variant="ghost">
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                      ) : (
                        <>Upload Selected</>
                      )}
                    </Button>
                  </div>

                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from(selectedFiles).map((f, i) => (
                        <div key={i} className="w-24 h-16 overflow-hidden rounded border">
                          <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {form.includes?.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeInclude(item)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://.../image.jpg"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                    />
                    <Button type="button" onClick={addImageUrl} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {form.imageUrls?.map((url, index) => (
                      <div key={index} className="relative w-24 h-16 rounded overflow-hidden border">
                        <img src={url} alt={`img-${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImageUrl(url)} className="absolute top-0 right-0 m-1 p-1 bg-white rounded text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {!form.imageUrls || form.imageUrls.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No images added. You can paste image URLs above.</div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Package is active and visible to clients
                </Label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingId ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPackages}</p>
                <p className="text-sm text-muted-foreground">Total Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePackages}</p>
                <p className="text-sm text-muted-foreground">Active Packages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Value (DA)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averagePrice.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Avg. Price (DA)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Service Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading packages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-red-700 font-medium">Error loading packages</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((pkg) => (
                <Card key={pkg.id} className={`hover:shadow-lg transition-all ${pkg.isActive === false ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    {pkg.imageUrls && pkg.imageUrls.length > 0 && (
                      <div className="mb-4 h-40 overflow-hidden rounded-md">
                        <img src={pkg.imageUrls[0]} alt={pkg.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{pkg.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getCategoryIcon(pkg.category)}
                              {getCategoryName(pkg.category)}
                            </Badge>
                            <Badge variant={pkg.isActive === false ? "secondary" : "default"}>
                              {pkg.isActive === false ? "Inactive" : "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {(pkg.priceCents / 100).toLocaleString()} DA
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(pkg.durationMinutes)}</span>
                        </div>

                        {pkg.description && (
                          <p className="text-muted-foreground line-clamp-2">{pkg.description}</p>
                        )}
                      </div>

                      {/* Included Items */}
                      {pkg.includes && pkg.includes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Includes:</p>
                          <div className="flex flex-wrap gap-1">
                            {pkg.includes.slice(0, 3).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {pkg.includes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pkg.includes.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Footer */}
                      <div className="flex items-start justify-between gap-3 pt-2">
                        {/* left side */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{new Date(pkg.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* right side – button strip */}
                        <div className="flex flex-wrap items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 text-xs leading-tight whitespace-normal"
                            onClick={() => togglePackageStatus(pkg)}
                          >
                            {pkg.isActive === false ? 'Activate' : 'Deactivate'}
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => openEdit(pkg)}>
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(pkg)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
              <p className="text-muted-foreground mb-4">Create your first service package to get started</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Package
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {packageToDelete && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">{packageToDelete.title}</h4>
              <p className="text-sm text-muted-foreground">
                {(packageToDelete.priceCents / 100).toLocaleString()} DA • {getCategoryName(packageToDelete.category)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => packageToDelete && handleDelete(packageToDelete.id)}
            >
              Delete Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}