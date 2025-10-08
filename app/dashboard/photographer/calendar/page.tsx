"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Plus, Trash2, Edit3, Clock, MapPin, User, AlertCircle, Loader2, CalendarDays } from "lucide-react"
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
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  
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

  const resetForm = () => {
    setStartAt("")
    setEndAt("")
    setTitle("")
    setType("blocked")
  }

  const handleCreate = async () => {
    if (!startAt || !endAt) {
      setError("Start and end dates are required")
      return
    }

    if (new Date(startAt) >= new Date(endAt)) {
      setError("End date must be after start date")
      return
    }

    setCreating(true)
    try {
      await Api.post("/calendar", { startAt, endAt, title, type })
      setOpenCreate(false)
      resetForm()
      await loadRange()
    } catch (e: any) {
      setError(e?.message || "Failed to create calendar block")
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedItem || !startAt || !endAt) return

    if (new Date(startAt) >= new Date(endAt)) {
      setError("End date must be after start date")
      return
    }

    setCreating(true)
    try {
      const cleanId = selectedItem.id.replace(/^ce_/, '')
      await Api.put(`/calendar/${cleanId}`, { startAt, endAt, title, type })
      setOpenEdit(false)
      resetForm()
      setSelectedItem(null)
      await loadRange()
    } catch (e: any) {
      setError(e?.message || "Failed to update calendar block")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      const cleanId = selectedItem.id.replace(/^ce_/, '')
      await Api.delete(`/calendar/${cleanId}`)
      setItems((prev) => prev.filter((it) => it.id !== selectedItem.id))
      setOpenDelete(false)
      setSelectedItem(null)
    } catch (e: any) {
      setError(e?.message || "Failed to delete calendar block")
    }
  }

  const openEditDialog = (item: any) => {
    setSelectedItem(item)
    setStartAt(item.startAt.slice(0, 16))
    setEndAt(item.endAt.slice(0, 16))
    setTitle(item.title || "")
    setType(item.type)
    setOpenEdit(true)
  }

  const openDeleteDialog = (item: any) => {
    setSelectedItem(item)
    setOpenDelete(true)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "blocked": return "bg-red-100 text-red-800 border-red-200"
      case "available": return "bg-green-100 text-green-800 border-green-200"
      case "note": return "bg-blue-100 text-blue-800 border-blue-200"
      case "booking": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blocked": return "🚫"
      case "available": return "✅"
      case "note": return "📝"
      case "booking": return "📅"
      default: return "📌"
    }
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    } else {
      const days = Math.round(diffHours / 24)
      return `${days} day${days !== 1 ? 's' : ''}`
    }
  }

  const rows = useMemo(() => 
    items.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()), 
    [items]
  )

  const stats = useMemo(() => {
    const bookings = items.filter(item => item.type === 'booking').length
    const blocked = items.filter(item => item.type === 'blocked').length
    const available = items.filter(item => item.type === 'available').length
    const notes = items.filter(item => item.type === 'note').length
    
    return { bookings, blocked, available, notes, total: items.length }
  }, [items])

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Authentication required</h3>
          <p className="text-muted-foreground">Please log in to access the calendar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar Management</h1>
          <p className="text-muted-foreground">Manage your availability, blocked dates, and bookings</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Calendar Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar to manage availability.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startAt">Start Date & Time</Label>
                    <Input 
                      id="startAt"
                      type="datetime-local" 
                      value={startAt} 
                      onChange={(e) => setStartAt(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endAt">End Date & Time</Label>
                    <Input 
                      id="endAt"
                      type="datetime-local" 
                      value={endAt} 
                      onChange={(e) => setEndAt(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input 
                    id="title"
                    placeholder="Enter event title..." 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select value={type} onValueChange={(value: "blocked" | "available" | "note") => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blocked">🚫 Blocked (Unavailable)</SelectItem>
                      <SelectItem value="available">✅ Available (Open for Booking)</SelectItem>
                      <SelectItem value="note">📝 Note (Information Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenCreate(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create Event
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.blocked}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.bookings}</p>
                <p className="text-sm text-muted-foreground">Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.notes}</p>
                <p className="text-sm text-muted-foreground">Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="fromDate" className="whitespace-nowrap">From Date</Label>
                <Input 
                  id="fromDate"
                  type="date" 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)} 
                  className="w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="toDate" className="whitespace-nowrap">To Date</Label>
                <Input 
                  id="toDate"
                  type="date" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)} 
                  className="w-auto"
                />
              </div>
            </div>
            <Button onClick={loadRange} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load Calendar
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading calendar events...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-red-700 font-medium">Error loading calendar</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          ) : rows.length > 0 ? (
            <div className="space-y-3">
              {rows.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getTypeColor(item.type)} border`}>
                          {getTypeIcon(item.type)} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                        {item.source === 'booking' && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            📸 Booking
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-lg mb-2">
                        {item.title || (item.type === "booking" ? `Booking with ${item.client?.firstName || 'Client'}` : "Calendar Event")}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(item.startAt).toLocaleDateString()} at{" "}
                            {new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(item.endAt).toLocaleDateString()} at{" "}
                            {new Date(item.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Duration: {formatDuration(item.startAt, item.endAt)}</span>
                        </div>
                      </div>

                      {item.location && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.location.address}</span>
                        </div>
                      )}

                      {item.client && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Client: {item.client.firstName} {item.client.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      {item.source === "calendar_event" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">No calendar events in the selected date range</p>
              <Button onClick={() => setOpenCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start</Label>
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </div>
              <div>
                <Label>End</Label>
                <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Title</Label>
                <Input placeholder="Optional title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(value: "blocked" | "available" | "note") => setType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex-1" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setOpenEdit(false)} disabled={creating}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this calendar event?</p>
            {selectedItem && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedItem.title || "Calendar Event"}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedItem.startAt).toLocaleString()} - {new Date(selectedItem.endAt).toLocaleString()}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Delete
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setOpenDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}