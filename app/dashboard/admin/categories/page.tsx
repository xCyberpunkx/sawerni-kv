"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Tags, Loader2, Search } from "lucide-react"
import { Api } from "@/lib/api"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  createdAt: string
  _count?: {
    services: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load categories from API
  const loadCategories = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await Api.get<{ items: Category[] }>("/admin/categories?page=1&perPage=100")
      setCategories(response.items || [])
    } catch (err: any) {
      setError(err?.message || "Failed to load categories")
      console.error("Failed to load categories:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setSubmitting(true)
    try {
      if (editingCategory) {
        // Update existing category
        await Api.put(`/admin/categories/${editingCategory.id}`, formData)
        toast.success("Category updated successfully")
      } else {
        // Create new category
        await Api.post("/admin/categories", formData)
        toast.success("Category created successfully")
      }
      
      setDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
      loadCategories() // Refresh the list
    } catch (err: any) {
      toast.error(err?.message || "Failed to save category")
      console.error("Failed to save category:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
    })
    setDialogOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    const serviceCount = category?._count?.services || 0
    
    if (serviceCount > 0) {
      toast.error(`Cannot delete category with ${serviceCount} services. Please reassign services first.`)
      return
    }

    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      await Api.delete(`/admin/categories/${categoryId}`)
      toast.success("Category deleted successfully")
      loadCategories() // Refresh the list
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete category")
      console.error("Failed to delete category:", err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Category management</h1>
          <p className="text-muted-foreground">Organize services into categories</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category management</h1>
          <p className="text-muted-foreground">Organize services into categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setEditingCategory(null)
                setFormData({ name: "", description: "" })
              }}
            >
              <Plus className="h-4 w-4" />
              Add new category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit category" : "Add new category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Events, Portraits, Commercial"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Category description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveCategory} 
                  className="flex-1" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {editingCategory ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    editingCategory ? "Save changes" : "Add category"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)} 
                  className="flex-1 bg-transparent"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadCategories}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tags className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Total categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tags className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, c) => sum + (c._count?.services || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Tags className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredCategories.length}</p>
                <p className="text-sm text-muted-foreground">Filtered results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Tags className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No categories found" : "No categories yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Get started by creating your first category"
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => {
                  setEditingCategory(null)
                  setFormData({ name: "", description: "" })
                  setDialogOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
                    <Badge variant="outline" className="mb-2">
                      {category._count?.services || 0} services
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={(category._count?.services || 0) > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {category.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {category.slug}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(category.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>

                {(category._count?.services || 0) > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Cannot delete - has {category._count?.services} service(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
