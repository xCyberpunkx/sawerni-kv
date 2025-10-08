"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus, Trash2, Eye, ImageIcon, Edit, Star, Download, Share2, Tag, Filter, Camera, Calendar, Heart, BarChart3, Loader2, AlertCircle } from "lucide-react"
import { mockAuth } from "@/lib/auth"
import { Api, apiFetch } from "@/lib/api"

interface PortfolioImage {
  id: string
  url: string
  title?: string
  description?: string
  category?: string
  tags?: string[]
  metadata?: {
    width?: number
    height?: number
    size?: number
    format?: string
    cameraModel?: string
    lens?: string
    iso?: number
    aperture?: string
    shutterSpeed?: string
    focalLength?: string
    takenAt?: string
  }
  stats?: {
    views: number
    likes: number
    downloads: number
  }
  isFeatured?: boolean
  createdAt: string
  updatedAt?: string
}

export default function PortfolioPage() {
  const user = mockAuth.getCurrentUser()
  const [photographerId, setPhotographerId] = useState<string | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([])
  const [filteredPortfolio, setFilteredPortfolio] = useState<PortfolioImage[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "portrait",
    tags: [] as string[],
    isFeatured: false
  })
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Categories for organization
  const categories = [
    { value: "all", label: "All Photos", count: 0 },
    { value: "portrait", label: "Portrait", count: 0 },
    { value: "wedding", label: "Wedding", count: 0 },
    { value: "landscape", label: "Landscape", count: 0 },
    { value: "street", label: "Street", count: 0 },
    { value: "commercial", label: "Commercial", count: 0 },
    { value: "event", label: "Event", count: 0 },
    { value: "product", label: "Product", count: 0 },
    { value: "fashion", label: "Fashion", count: 0 },
    { value: "blackwhite", label: "Black & White", count: 0 }
  ]

  useEffect(() => {
    const run = async () => {
      const me = await Api.get<any>("/auth/me")
      const pid = me?.photographer?.id as string | undefined
      if (!pid) return
      setPhotographerId(pid)
    }
    run()
  }, [])

  const loadPortfolio = async () => {
    if (!photographerId) return
    setLoading(true)
    try {
      // Fetch all images in one go (adjust limit as needed)
      const items = await Api.get<any[]>(`/gallery/photographer/${photographerId}?limit=1000`)
      const portfolioItems: PortfolioImage[] = (items || []).map((it) => ({
        id: it.id,
        url: it.url,
        title: it.title,
        description: it.description,
        category: it.category || "portrait",
        tags: it.tags || [],
        metadata: it.metadata || {},
        stats: it.stats || { views: 0, likes: 0, downloads: 0 },
        isFeatured: it.isFeatured || false,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt
      }))
      setPortfolio(portfolioItems)
    } catch (e: any) {
      setError(e?.message || "Failed to load portfolio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (photographerId) loadPortfolio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId])

  // Filter and sort portfolio
  useEffect(() => {
    let filtered = [...portfolio]
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(img => img.category === activeCategory)
    }
    
    // Sort images
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "popular":
        filtered.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
        break
      case "featured":
        filtered = filtered.filter(img => img.isFeatured)
        break
    }
    
    setFilteredPortfolio(filtered)
  }, [portfolio, activeCategory, sortBy])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    setError("")
    
    const uploadedImages: PortfolioImage[] = []
    
    try {
      for (const file of selectedFiles) {
        const form = new FormData()
        form.append("image", file)
        form.append("meta", JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          tags: uploadForm.tags,
          isFeatured: uploadForm.isFeatured
        }))
        
        const res = await apiFetch<any>("/gallery", { method: "POST", body: form, multipart: true })
        
        uploadedImages.push({
          id: res.id,
          url: res.url,
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          tags: uploadForm.tags,
          metadata: res.metadata || {},
          stats: { views: 0, likes: 0, downloads: 0 },
          isFeatured: uploadForm.isFeatured,
          createdAt: new Date().toISOString()
        })
      }
      
      setPortfolio((prev) => [...uploadedImages, ...prev])
      setUploadDialogOpen(false)
      resetUploadForm()
      setSelectedFiles([])
    } catch (e: any) {
      setError(e?.message || "Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateImage = async () => {
    if (!selectedImage) return
    
    setUploading(true)
    try {
      const updated = await Api.put<PortfolioImage>(`/gallery/${selectedImage.id}`, {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        tags: uploadForm.tags,
        isFeatured: uploadForm.isFeatured
      })
      
      setPortfolio((prev) => prev.map((img) => (img.id === selectedImage.id ? updated : img)))
      setEditDialogOpen(false)
      setSelectedImage(null)
      resetUploadForm()
    } catch (e: any) {
      setError(e?.message || "Failed to update image")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    try {
      await Api.delete(`/gallery/${id}`)
      setPortfolio((prev) => prev.filter((img) => img.id !== id))
    } catch (e: any) {
      setError(e?.message || "Failed to delete image")
    }
  }

  const openEditDialog = (image: PortfolioImage) => {
    setSelectedImage(image)
    setUploadForm({
      title: image.title || "",
      description: image.description || "",
      category: image.category || "portrait",
      tags: image.tags || [],
      isFeatured: image.isFeatured || false
    })
    setEditDialogOpen(true)
  }

  const openViewDialog = (image: PortfolioImage) => {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  const resetUploadForm = () => {
    setUploadForm({
      title: "",
      description: "",
      category: "portrait",
      tags: [],
      isFeatured: false
    })
    setNewTag("")
  }

  const addTag = () => {
    if (newTag.trim() && !uploadForm.tags.includes(newTag.trim())) {
      setUploadForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setUploadForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "portrait": return "👤"
      case "wedding": return "💍"
      case "landscape": return "🌄"
      case "street": return "🏙️"
      case "commercial": return "💼"
      case "event": return "🎉"
      case "product": return "📦"
      case "fashion": return "👗"
      case "blackwhite": return "⚫"
      default: return "📷"
    }
  }

  // Statistics
  const stats = {
    totalImages: portfolio.length,
    totalViews: portfolio.reduce((sum, img) => sum + (img.stats?.views || 0), 0),
    totalLikes: portfolio.reduce((sum, img) => sum + (img.stats?.likes || 0), 0),
    totalDownloads: portfolio.reduce((sum, img) => sum + (img.stats?.downloads || 0), 0),
    featuredImages: portfolio.filter(img => img.isFeatured).length,
    thisMonthUploads: portfolio.filter(img => {
      const uploadDate = new Date(img.createdAt)
      const now = new Date()
      return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear()
    }).length
  }

  const averageRating = 4.9 // This could come from API

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Gallery</h1>
          <p className="text-muted-foreground">Showcase your best work and attract new clients</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Photos</DialogTitle>
              <DialogDescription>
                Add new photos to your portfolio. You can upload multiple images at once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drag photos here or click to select</p>
                <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG, WEBP up to 10MB each</p>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  id="pf-upload" 
                  onChange={handleFileSelect}
                />
                <label htmlFor="pf-upload">
                  <Button variant="outline" className="bg-transparent" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
                
                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium mb-2">Selected files ({selectedFiles.length}):</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Details Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Photo Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a title for your photos..."
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={uploadForm.category} 
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat.value !== "all").map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {getCategoryIcon(category.value)} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this photo or collection..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uploadForm.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={uploadForm.isFeatured}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isFeatured" className="text-sm font-normal">
                    Mark as featured (showcase on your profile)
                  </Label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleUploadImages} disabled={uploading || selectedFiles.length === 0}>
                  {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''} Photos
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalImages}</p>
                <p className="text-sm text-muted-foreground">Total Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLikes}</p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                <p className="text-sm text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featuredImages}</p>
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating}</p>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full lg:w-auto">
              <TabsList className="flex flex-wrap h-auto">
                {categories.map(category => (
                  <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                    {category.value !== "all" && getCategoryIcon(category.value)}
                    {category.label}
                    {category.count > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center">
                        {category.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Grid */}
      {filteredPortfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPortfolio.map((image, index) => (
            <Card key={image.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[4/3] bg-muted">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.title || `Portfolio image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <Button size="sm" variant="secondary" onClick={() => openViewDialog(image)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEditDialog(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Featured badge */}
                {image.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0">
                    {getCategoryIcon(image.category || "portrait")}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {image.title || `Photo ${index + 1}`}
                  </h3>
                  
                  {image.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.description}
                    </p>
                  )}

                  {/* Tags */}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 2).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{image.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{image.stats?.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{image.stats?.likes || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    </div>
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
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {activeCategory !== "all" ? `No ${categories.find(c => c.value === activeCategory)?.label} Photos` : "Empty Portfolio"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeCategory !== "all" 
                  ? `You haven't added any ${categories.find(c => c.value === activeCategory)?.label.toLowerCase()} photos yet.`
                  : "Start adding your work to showcase your skills to potential clients"
                }
              </p>
              <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Your First Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedImage.title || "Photo Details"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <img
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.title || "Portfolio image"}
                    className="w-full h-auto max-h-96 object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Category</p>
                      <Badge variant="outline" className="mt-1">
                        {getCategoryIcon(selectedImage.category || "portrait")} 
                        {categories.find(c => c.value === selectedImage.category)?.label || "Portrait"}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Uploaded</p>
                      <p className="text-muted-foreground">
                        {new Date(selectedImage.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedImage.stats?.views || 0}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedImage.stats?.likes || 0}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedImage.stats?.downloads || 0}</p>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => openEditDialog(selectedImage)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Photo Title</Label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter photo title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={uploadForm.category} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.value !== "all").map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {getCategoryIcon(category.value)} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this photo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadForm.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isFeatured"
                checked={uploadForm.isFeatured}
                onChange={(e) => setUploadForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-isFeatured" className="text-sm font-normal">
                Mark as featured
              </Label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpdateImage} disabled={uploading}>
                {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}