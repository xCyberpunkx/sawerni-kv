"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, CheckCircle, MessageCircle, User } from "lucide-react"

interface Issue {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  reportedBy: string
  reportedAt: string
  category: string
}

const initialIssues: Issue[] = [
  {
    id: "1",
    title: "مشكلة في رفع الصور",
    description: "لا أستطيع رفع الصور إلى معرض الأعمال، تظهر رسالة خطأ",
    status: "open",
    priority: "high",
    reportedBy: "فاطمة زهراء",
    reportedAt: "2024-11-15T10:30:00Z",
    category: "تقني",
  },
  {
    id: "2",
    title: "عدم وصول إشعارات الحجز",
    description: "لا تصلني إشعارات عند وجود حجوزات جديدة",
    status: "in-progress",
    priority: "medium",
    reportedBy: "يوسف بن محمد",
    reportedAt: "2024-11-14T15:45:00Z",
    category: "إشعارات",
  },
  {
    id: "3",
    title: "مشكلة في الدفع",
    description: "فشل في عملية الدفع رغم صحة بيانات البطاقة",
    status: "resolved",
    priority: "high",
    reportedBy: "أحمد بن علي",
    reportedAt: "2024-11-13T09:20:00Z",
    category: "دفع",
  },
]

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [response, setResponse] = useState("")

  const openIssues = issues.filter((issue) => issue.status === "open")
  const inProgressIssues = issues.filter((issue) => issue.status === "in-progress")
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved")

  const handleStatusChange = (issueId: string, newStatus: Issue["status"]) => {
    setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status: newStatus } : issue)))
  }

  const handleSendResponse = (issueId: string) => {
    // In a real app, this would send the response to the user
    console.log("Sending response to issue:", issueId, response)
    setResponse("")
  }

  const getPriorityColor = (priority: Issue["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityText = (priority: Issue["priority"]) => {
    switch (priority) {
      case "high":
        return "عالية"
      case "medium":
        return "متوسطة"
      case "low":
        return "منخفضة"
      default:
        return priority
    }
  }

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{issue.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>
            </div>
            <Badge variant={getPriorityColor(issue.priority)}>{getPriorityText(issue.priority)}</Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{issue.reportedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(issue.reportedAt).toLocaleDateString("ar-DZ")}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {issue.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <MessageCircle className="h-4 w-4" />
                  عرض التفاصيل
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>تفاصيل المشكلة #{issue.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{issue.title}</h4>
                      <p className="text-muted-foreground">{issue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">المبلغ عنها بواسطة</p>
                        <p className="text-muted-foreground">{issue.reportedBy}</p>
                      </div>
                      <div>
                        <p className="font-medium">التاريخ</p>
                        <p className="text-muted-foreground">
                          {new Date(issue.reportedAt).toLocaleDateString("ar-DZ")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">الأولوية</p>
                        <Badge variant={getPriorityColor(issue.priority)}>{getPriorityText(issue.priority)}</Badge>
                      </div>
                      <div>
                        <p className="font-medium">الفئة</p>
                        <p className="text-muted-foreground">{issue.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">إرسال رد</h4>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      rows={4}
                    />
                    <Button onClick={() => handleSendResponse(issue.id)} className="w-full">
                      إرسال الرد
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {issue.status === "open" && (
                      <Button
                        onClick={() => handleStatusChange(issue.id, "in-progress")}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        بدء المعالجة
                      </Button>
                    )}
                    {issue.status === "in-progress" && (
                      <Button onClick={() => handleStatusChange(issue.id, "resolved")} className="flex-1">
                        تم الحل
                      </Button>
                    )}
                    {issue.status !== "resolved" && (
                      <Button
                        onClick={() => handleStatusChange(issue.id, "resolved")}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        إغلاق
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {issue.status === "open" && (
              <Button size="sm" onClick={() => handleStatusChange(issue.id, "in-progress")}>
                بدء المعالجة
              </Button>
            )}
            {issue.status === "in-progress" && (
              <Button size="sm" onClick={() => handleStatusChange(issue.id, "resolved")}>
                تم الحل
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إدارة المشاكل</h1>
        <p className="text-muted-foreground">تابع وحل مشاكل المستخدمين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openIssues.length}</p>
                <p className="text-sm text-muted-foreground">مشاكل جديدة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressIssues.length}</p>
                <p className="text-sm text-muted-foreground">قيد المعالجة</p>
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
                <p className="text-2xl font-bold">{resolvedIssues.length}</p>
                <p className="text-sm text-muted-foreground">تم حلها</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{issues.length}</p>
                <p className="text-sm text-muted-foreground">إجمالي المشاكل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Tabs */}
      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">جديدة ({openIssues.length})</TabsTrigger>
          <TabsTrigger value="in-progress">قيد المعالجة ({inProgressIssues.length})</TabsTrigger>
          <TabsTrigger value="resolved">محلولة ({resolvedIssues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openIssues.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {openIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مشاكل جديدة</h3>
                <p className="text-muted-foreground">جميع المشاكل تم التعامل معها</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressIssues.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inProgressIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مشاكل قيد المعالجة</h3>
                <p className="text-muted-foreground">لا توجد مشاكل يتم العمل عليها حالياً</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedIssues.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {resolvedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مشاكل محلولة</h3>
                <p className="text-muted-foreground">لم يتم حل أي مشاكل بعد</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
