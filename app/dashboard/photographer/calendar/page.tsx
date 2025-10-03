"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"

export default function PhotographerCalendarPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [from, setFrom] = useState<string>(new Date().toISOString().slice(0, 10))
  const [to, setTo] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })

  const [openCreate, setOpenCreate] = useState(false)
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"blocked" | "available" | "note">("blocked")

  useEffect(() => {
    const run = async () => {
      setError("")
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
  }, [])

  const loadRange = async () => {
    if (!photographerId) return
    setLoading(true)
    setError("")
    try {
      const qs = `?from=${from}&to=${to}`
      const res = await Api.get<{ items: any[] }>(`/calendar/photographer/${photographerId}${qs}`)
      setItems(res.items || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load calendar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId])

  const handleCreate = async () => {
    if (!startAt || !endAt) return
    try {
      await Api.post("/calendar", { startAt, endAt, title, type })
      setOpenCreate(false)
      setStartAt("")
      setEndAt("")
      setTitle("")
      setType("blocked")
      await loadRange()
    } catch (e: any) {
      setError(e?.message || "Failed to create calendar block")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await Api.delete(`/calendar/${id}`)
      setItems((prev) => prev.filter((it) => it.id !== id))
    } catch (e: any) {
      setError(e?.message || "Failed to delete calendar block")
    }
  }

  const rows = useMemo(() => items.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()), [items])

  if (!user) {
    return <div className="p-6">Authentication required.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your availability and blocked dates</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New block
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create calendar block</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Start</Label>
                  <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input placeholder="Optional title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Type</Label>
                  <Input placeholder="blocked | available | note" value={type} onChange={(e) => setType(e.target.value as any)} />
                </div>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">Create</Button>
                <Button variant="outline" className="bg-transparent flex-1" onClick={() => setOpenCreate(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button onClick={loadRange}>Load</Button>
          </div>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : rows.length > 0 ? (
            <div className="space-y-2">
              {rows.map((it) => (
                <div key={it.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{it.title || (it.type === "booking" ? it.title || "Booking" : "Event")}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(it.startAt).toLocaleString()} → {new Date(it.endAt).toLocaleString()} ({it.type})
                    </div>
                  </div>
                  {it.source === "calendar_event" && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(it.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No items in this range.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


