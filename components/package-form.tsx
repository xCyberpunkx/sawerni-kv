"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X } from "lucide-react"
export interface PackageModel {
  id: string
  name: string
  description: string
  price: number
  duration: string
  includes: string[]
}

interface PackageFormProps {
  package?: PackageModel
  onSave: (packageData: Omit<PackageModel, "id">) => void
  onCancel: () => void
  trigger?: React.ReactNode
}

export function PackageForm({ package: existingPackage, onSave, onCancel, trigger }: PackageFormProps) {
  const [formData, setFormData] = useState({
    name: existingPackage?.name || "",
    description: existingPackage?.description || "",
    price: existingPackage?.price || 0,
    duration: existingPackage?.duration || "",
    includes: existingPackage?.includes || [],
  })
  const [newInclude, setNewInclude] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setOpen(false)
    if (!existingPackage) {
      // Reset form for new package
      setFormData({
        name: "",
        description: "",
        price: 0,
        duration: "",
        includes: [],
      })
    }
  }

  const addInclude = () => {
    if (newInclude.trim()) {
      setFormData((prev) => ({
        ...prev,
        includes: [...prev.includes, newInclude.trim()],
      }))
      setNewInclude("")
    }
  }

  const removeInclude = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add new package
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingPackage ? "Edit package" : "Add new package"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Golden wedding package"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 8 hours"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (DA)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
              placeholder="50000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Package description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the package and inclusions..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Package includes</Label>

            <div className="flex gap-2">
              <Input
                value={newInclude}
                onChange={(e) => setNewInclude(e.target.value)}
                placeholder="e.g., 100 edited photos"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInclude())}
              />
              <Button type="button" onClick={addInclude} size="sm">
                Add
              </Button>
            </div>

            {formData.includes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Added items:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.includes.map((item, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {item}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeInclude(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {existingPackage ? "Save changes" : "Add package"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
