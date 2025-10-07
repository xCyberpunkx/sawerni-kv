"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface PackageDto {
  id: string
  photographerId: string
  title: string
  description?: string
  priceCents: number
  createdAt: string
}

interface UpsertPackageDto {
  title: string
  description?: string
  priceCents: number
}

export default function PhotographerPackagesPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [items, setItems] = useState<PackageDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UpsertPackageDto>({ title: "", description: "", priceCents: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (!user) return
      try {
        const me = await Api.get<any>("/auth/me")
        const pid = me?.photographer?.id as string | undefined
        if (!pid) return
        setPhotographerId(pid)
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      }
    }
    run()
  }, [user])

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
    setForm({ title: "", description: "", priceCents: 0 })
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (pkg: PackageDto) => {
    setEditingId(pkg.id)
    setForm({ title: pkg.title, description: pkg.description || "", priceCents: pkg.priceCents })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || form.priceCents < 0) return
    setSaving(true)
    setError("")
    try {
      if (editingId) {
        // optimistic update
        const prev = items
        setItems((old) => old.map((it) => (it.id === editingId ? { ...it, ...form } as PackageDto : it)))
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
          priceCents: form.priceCents,
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
    const prev = items
    setItems((old) => old.filter((it) => it.id !== id))
    try {
      await Api.delete(`/packages/${id}`)
    } catch (e: any) {
      setItems(prev)
      setError(e?.message || "Failed to delete package")
    }
  }

  const totalPackages = useMemo(() => items.length, [items])

  if (!user) {
    return <div className="p-6">Authentication required.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-muted-foreground">Create and manage your service packages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit package" : "Create package"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Basic Portrait Session"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (DA)</Label>
                  <Input
                    type="number"
                    value={form.priceCents}
                    onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
                    placeholder="15000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent flex-1"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPackages}</p>
                <p className="text-sm text-muted-foreground">Total packages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : items.length > 0 ? (
            <div className="space-y-2">
              {items.map((pkg) => (
                <div key={pkg.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{pkg.title}</p>
                      <Badge variant="secondary">{(pkg.priceCents).toLocaleString()} DA</Badge>
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">{pkg.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(pkg)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No packages yet. Create your first package.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
