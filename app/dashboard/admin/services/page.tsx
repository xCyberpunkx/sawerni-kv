"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Settings } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  isActive: boolean
  userCount: number
}

const initialServices: Service[] = [
  {
    id: "1",
    name: "Wedding photography",
    description: "Photography services for weddings and private events",
    isActive: true,
    userCount: 45,
  },
  {
    id: "2",
    name: "Event photography",
    description: "Photography for public and private events and celebrations",
    isActive: true,
    userCount: 32,
  },
  {
    id: "3",
    name: "Portrait photography",
    description: "Personal and portrait photo sessions",
    isActive: true,
    userCount: 28,
  },
  {
    id: "4",
    name: "Kids photography",
    description: "Photography for children and families",
    isActive: true,
    userCount: 19,
  },
  {
    id: "5",
    name: "Commercial photography",
    description: "Photography for businesses and products",
    isActive: false,
    userCount: 12,
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSaveService = () => {
    if (editingService) {
      // Update existing service
      setServices((prev) =>
        prev.map((service) => (service.id === editingService.id ? { ...service, ...formData } : service)),
      )
    } else {
      // Add new service
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        userCount: 0,
      }
      setServices((prev) => [...prev, newService])
    }

    setDialogOpen(false)
    setEditingService(null)
    setFormData({ name: "", description: "", isActive: true })
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      isActive: service.isActive,
    })
    setDialogOpen(true)
  }

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((service) => service.id !== serviceId))
  }

  const toggleServiceStatus = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) => (service.id === serviceId ? { ...service, isActive: !service.isActive } : service)),
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service management</h1>
          <p className="text-muted-foreground">Manage the service types available on the platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setEditingService(null)
                setFormData({ name: "", description: "", isActive: true })
              }}
            >
              <Plus className="h-4 w-4" />
              Add new service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit service" : "Add new service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Wedding photography"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Service description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed description of the service..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="isActive">Active service</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveService} className="flex-1">
                  {editingService ? "Save changes" : "Add service"}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services.length}</p>
                <p className="text-sm text-muted-foreground">Total services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services.filter((s) => s.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Settings className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services.reduce((sum, s) => sum + s.userCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Total users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditService(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Users:</span>
                <span className="font-medium">{service.userCount} photographers</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => toggleServiceStatus(service.id)}
              >
                {service.isActive ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
