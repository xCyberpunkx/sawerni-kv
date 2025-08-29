"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, Trash2, Eye, ImageIcon, Edit } from "lucide-react"
import { demoPhotographers } from "@/lib/demo-data"
import { mockAuth } from "@/lib/auth"

export default function PortfolioPage() {
  const user = mockAuth.getCurrentUser()
  const photographer = demoPhotographers.find((p) => p.id === user?.id)
  const [portfolio, setPortfolio] = useState<string[]>(photographer?.portfolio || [])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const handleAddImage = () => {
    // In a real app, this would handle file upload
    const newImage = `/placeholder.svg?height=400&width=600&query=professional photography sample ${portfolio.length + 1}`
    setPortfolio((prev) => [...prev, newImage])
    setUploadDialogOpen(false)
  }

  const handleDeleteImage = (index: number) => {
    setPortfolio((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">معرض الأعمال</h1>
          <p className="text-muted-foreground">أضف وأدر صور أعمالك لجذب العملاء</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة صور
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة صور جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">اسحب الصور هنا أو انقر للتحديد</p>
                <p className="text-sm text-muted-foreground mb-4">يمكنك رفع ملفات JPG, PNG, WEBP حتى 10MB</p>
                <Button variant="outline" className="bg-transparent">
                  اختر الملفات
                </Button>
              </div>

              <div className="space-y-2">
                <Label>وصف الصورة (اختياري)</Label>
                <Input placeholder="وصف مختصر للصورة..." />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddImage} className="flex-1">
                  إضافة الصور
                </Button>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)} className="flex-1 bg-transparent">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolio.length}</p>
                <p className="text-sm text-muted-foreground">إجمالي الصور</p>
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
                <p className="text-2xl font-bold">2,456</p>
                <p className="text-sm text-muted-foreground">مشاهدات المعرض</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">رفع هذا الشهر</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">تقييم الصور</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Grid */}
      {portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {portfolio.map((image, index) => (
            <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-square">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    صورة {index + 1}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{Math.floor(Math.random() * 100) + 20}</span>
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
              <h3 className="text-xl font-semibold mb-2">معرض فارغ</h3>
              <p className="text-muted-foreground mb-6">ابدأ بإضافة صور أعمالك لإظهار مهاراتك للعملاء المحتملين</p>
              <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة أول صورة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
