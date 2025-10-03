"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, CheckCircle, MessageCircle, User } from "lucide-react"
import { Api } from "@/lib/api"

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

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        // Use admin review moderation endpoints as the "issues" source
        const pending = await Api.get<{ items: any[] }>("/admin/reviews?status=PENDING&page=1&perPage=50")
        const approved = await Api.get<{ items: any[] }>("/admin/reviews?status=APPROVED&page=1&perPage=50")
        const rejected = await Api.get<{ items: any[] }>("/admin/reviews?status=REJECTED&page=1&perPage=50")

        const mapReviewToIssue = (r: any, status: Issue["status"]): Issue => ({
          id: r.id,
          title: `Review ${r.rating}/5`,
          description: r.text || "",
          status,
          priority: r.rating <= 2 ? "high" : r.rating === 3 ? "medium" : "low",
          reportedBy: r.reviewer?.name || "User",
          reportedAt: r.createdAt,
          category: "Review",
        })

        const mapped: Issue[] = [
          ...(pending.items || []).map((r) => mapReviewToIssue(r, "open")),
          ...(approved.items || []).map((r) => mapReviewToIssue(r, "resolved")),
          ...(rejected.items || []).map((r) => mapReviewToIssue(r, "resolved")),
        ]
        setIssues(mapped)
      } catch (e: any) {
        setError(e?.message || "Failed to load issues")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const openIssues = issues.filter((issue) => issue.status === "open")
  const inProgressIssues = issues.filter((issue) => issue.status === "in-progress")
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved")

  const handleStatusChange = async (issueId: string, newStatus: Issue["status"]) => {
    try {
      if (newStatus === "in-progress") {
        setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status: newStatus } : issue)))
        return
      }
      const action = "approve" // treat resolution as approve by default
      await Api.patch(`/admin/reviews/${issueId}`, { action, reason: response || undefined })
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status: "resolved" } : issue)))
    } catch {}
  }

  const handleSendResponse = async (issueId: string) => {
    try {
      await Api.patch(`/admin/reviews/${issueId}`, { action: "approve", reason: response || undefined })
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status: "resolved" } : issue)))
    } catch {}
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
        return "High"
      case "medium":
        return "Medium"
      case "low":
        return "Low"
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
              <span>{new Date(issue.reportedAt).toLocaleDateString("en-US")}</span>
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
                  View details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Issue details #{issue.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{issue.title}</h4>
                      <p className="text-muted-foreground">{issue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Reported by</p>
                        <p className="text-muted-foreground">{issue.reportedBy}</p>
                      </div>
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-muted-foreground">
                          {new Date(issue.reportedAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Priority</p>
                        <Badge variant={getPriorityColor(issue.priority)}>{getPriorityText(issue.priority)}</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Category</p>
                        <p className="text-muted-foreground">{issue.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Send response</h4>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                    />
                    <Button onClick={() => handleSendResponse(issue.id)} className="w-full">
                      Send response
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {issue.status === "open" && (
                      <Button
                        onClick={() => handleStatusChange(issue.id, "in-progress")}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Start processing
                      </Button>
                    )}
                    {issue.status === "in-progress" && (
                      <Button onClick={() => handleStatusChange(issue.id, "resolved")} className="flex-1">
                        Resolved
                      </Button>
                    )}
                    {issue.status !== "resolved" && (
                      <Button
                        onClick={() => handleStatusChange(issue.id, "resolved")}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {issue.status === "open" && (
              <Button size="sm" onClick={() => handleStatusChange(issue.id, "in-progress")}>
                Start processing
              </Button>
            )}
            {issue.status === "in-progress" && (
              <Button size="sm" onClick={() => handleStatusChange(issue.id, "resolved")}>
                Resolved
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
        <h1 className="text-3xl font-bold">Issue management</h1>
        <p className="text-muted-foreground">Track and resolve user issues</p>
      </div>

      {/* Stats */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openIssues.length}</p>
                <p className="text-sm text-muted-foreground">New issues</p>
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
                <p className="text-sm text-muted-foreground">In progress</p>
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
                <p className="text-sm text-muted-foreground">Resolved</p>
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
                <p className="text-sm text-muted-foreground">Total issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Tabs */}
      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">Open ({openIssues.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In progress ({inProgressIssues.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedIssues.length})</TabsTrigger>
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
                <h3 className="text-lg font-semibold mb-2">No new issues</h3>
                <p className="text-muted-foreground">All issues have been handled</p>
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
                <h3 className="text-lg font-semibold mb-2">No issues in progress</h3>
                <p className="text-muted-foreground">There are no issues being worked on currently</p>
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
                <h3 className="text-lg font-semibold mb-2">No resolved issues</h3>
                <p className="text-muted-foreground">No issues have been resolved yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}