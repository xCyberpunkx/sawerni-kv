"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Api } from "@/lib/api"
import { 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Send,
  Signature,
  RefreshCw,
  MoreVertical,
  Eye,
  Archive
} from "lucide-react"
import { toast } from "sonner"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BookingItem {
  id: string
  client?: { 
    id: string; 
    name: string; 
    email?: string;
    avatar?: string;
    phone?: string;
  }
  state: string
  startAt: string
  endAt: string
  location?: string
  serviceType?: string
  totalAmount?: number
  createdAt: string
  contract?: { 
    id: string; 
    status: "DRAFT" | "SENT" | "SIGNED" | "EXPIRED" | "REJECTED";
    pdfUrl?: string; 
    signedAt?: string;
    sentAt?: string;
    expiresAt?: string;
    terms?: string;
  }
}

type ContractStatus = "all" | "draft" | "sent" | "signed" | "expired"

export default function ContractsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeContractUrl, setActiveContractUrl] = useState<string | null>(null)
  const [signingId, setSigningId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContractStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState<string | null>(null)
  const [customTerms, setCustomTerms] = useState("")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<{ items: any[] }>("/bookings/received?page=1&perPage=100")
      setBookings(res.items as any)
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to load bookings"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const generateContract = async (bookingId: string, terms?: string) => {
    setIsGenerating(bookingId)
    try {
      const payload: any = { bookingId }
      if (terms) {
        payload.customTerms = terms
      }
      
      const res = await Api.post<any>("/contracts/generate", payload)
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, contract: res.contract } : b)))
      if (res.contract?.pdfUrl) {
        setActiveContractUrl(res.contract.pdfUrl)
        toast.success("Contract generated successfully")
      }
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to generate contract"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsGenerating(null)
      setCustomTerms("")
    }
  }

  const sendContract = async (contractId: string) => {
    try {
      await Api.post(`/contracts/${contractId}/send`)
      setBookings((prev) => prev.map((b) => 
        b.contract?.id === contractId 
          ? { ...b, contract: { ...b.contract, status: "SENT", sentAt: new Date().toISOString() } } 
          : b
      ))
      toast.success("Contract sent to client")
    } catch (e: any) {
      toast.error(e?.message || "Failed to send contract")
    }
  }

  const signContract = async (contractId: string) => {
    const canvas = canvasRef.current
    if (!canvas) {
      toast.error("Signature canvas not available")
      return
    }

    // Check if signature is not empty
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const isEmpty = imageData.data.every(channel => channel === 0)
      if (isEmpty) {
        toast.error("Please provide a signature")
        return
      }
    }

    setIsSigning(contractId)
    const dataUrl = canvas.toDataURL("image/png")
    try {
      const res = await Api.post<any>(`/contracts/${contractId}/sign`, { signatureDataUrl: dataUrl })
      setBookings((prev) => prev.map((b) => 
        b.contract?.id === contractId 
          ? { ...b, contract: { ...res, status: "SIGNED", signedAt: new Date().toISOString() } } 
          : b
      ))
      setSigningId(null)
      clearSignature()
      toast.success("Contract signed successfully")
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to sign contract"
      toast.error(errorMessage)
    } finally {
      setIsSigning(null)
    }
  }

  const downloadContract = async (contractId: string, filename?: string) => {
    try {
      const contract = bookings.find(b => b.contract?.id === contractId)?.contract
      if (!contract?.pdfUrl) {
        toast.error("No contract PDF available")
        return
      }
      
      const response = await fetch(contract.pdfUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `contract-${contractId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Contract downloaded")
    } catch (e: any) {
      toast.error(e?.message || "Failed to download contract")
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "black"
  }

  // Enhanced drawing functionality
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)

    const draw = (ev: MouseEvent) => {
      if (!isDrawing) return
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const stopDrawing = () => {
      setIsDrawing(false)
      window.removeEventListener("mousemove", draw)
      window.removeEventListener("mouseup", stopDrawing)
    }

    window.addEventListener("mousemove", draw)
    window.addEventListener("mouseup", stopDrawing)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: "bg-gray-100 text-gray-800",
      SENT: "bg-blue-100 text-blue-800",
      SIGNED: "bg-green-100 text-green-800",
      EXPIRED: "bg-red-100 text-red-800",
      REJECTED: "bg-red-100 text-red-800"
    }
    
    const icons = {
      DRAFT: <Edit className="h-3 w-3 mr-1" />,
      SENT: <Send className="h-3 w-3 mr-1" />,
      SIGNED: <CheckCircle className="h-3 w-3 mr-1" />,
      EXPIRED: <XCircle className="h-3 w-3 mr-1" />,
      REJECTED: <XCircle className="h-3 w-3 mr-1" />
    }

    return (
      <Badge variant="secondary" className={`text-xs ${variants[status as keyof typeof variants]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    )
  }

  const getBookingBadge = (state: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    }

    return (
      <Badge variant="secondary" className={variants[state as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {state.charAt(0).toUpperCase() + state.slice(1)}
      </Badge>
    )
  }

  // Filter bookings based on status and search
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "draft" && booking.contract?.status === "DRAFT") ||
      (filter === "sent" && booking.contract?.status === "SENT") ||
      (filter === "signed" && booking.contract?.status === "SIGNED") ||
      (filter === "expired" && booking.contract?.status === "EXPIRED")
    
    const matchesSearch = 
      searchQuery === "" ||
      booking.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceType?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const stats = {
    total: bookings.length,
    draft: bookings.filter(b => b.contract?.status === "DRAFT").length,
    sent: bookings.filter(b => b.contract?.status === "SENT").length,
    signed: bookings.filter(b => b.contract?.status === "SIGNED").length,
    expired: bookings.filter(b => b.contract?.status === "EXPIRED").length
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Contracts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and sign booking contracts with clients
          </p>
        </div>
        
        <Button onClick={loadBookings} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
            <div className="text-sm text-muted-foreground">Draft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.sent}</div>
            <div className="text-sm text-muted-foreground">Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
            <div className="text-sm text-muted-foreground">Signed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-muted-foreground">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by client name, booking ID, or service type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as ContractStatus)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="signed">Signed</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Contracts</CardTitle>
          <CardDescription>
            {filteredBookings.length} of {bookings.length} contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={loadBookings}>Try Again</Button>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">Booking #{booking.id.slice(-8)}</h3>
                            {getBookingBadge(booking.state)}
                          </div>
                          
                          {/* Client Info */}
                          {booking.client && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <User className="h-4 w-4" />
                              <span>{booking.client.name}</span>
                              {booking.client.email && (
                                <>
                                  <span>•</span>
                                  <Mail className="h-4 w-4" />
                                  <span>{booking.client.email}</span>
                                </>
                              )}
                            </div>
                          )}
                          
                          {/* Booking Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.startAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(booking.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {booking.serviceType && (
                              <Badge variant="outline">{booking.serviceType}</Badge>
                            )}
                            {booking.totalAmount && (
                              <span className="font-medium">${booking.totalAmount}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Contract Status */}
                        {booking.contract && (
                          <div className="text-right">
                            {getStatusBadge(booking.contract.status)}
                            {booking.contract.signedAt && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Signed {new Date(booking.contract.signedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contract Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!booking.contract ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm">
                              {isGenerating === booking.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <FileText className="h-4 w-4 mr-2" />
                              )}
                              Generate Contract
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => generateContract(booking.id)}>
                              Standard Contract
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setCustomTerms("")
                              const modal = document.getElementById('custom-terms-modal') as HTMLDialogElement
                              modal?.showModal()
                              // Store the current booking ID for the modal
                              modal?.setAttribute('data-booking-id', booking.id)
                            }}>
                              Custom Terms...
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setActiveContractUrl(booking.contract?.pdfUrl || null)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => downloadContract(booking.contract!.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              
                              {booking.contract.status === "DRAFT" && (
                                <DropdownMenuItem onClick={() => sendContract(booking.contract!.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send to Client
                                </DropdownMenuItem>
                              )}
                              
                              {booking.contract.status === "SENT" && (
                                <DropdownMenuItem onClick={() => setSigningId(booking.contract!.id)}>
                                  <Signature className="h-4 w-4 mr-2" />
                                  Sign Contract
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem className="text-red-600">
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No contracts found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Contracts will appear here once you generate them for bookings"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract PDF Modal */}
      {activeContractUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Contract PDF</CardTitle>
                <Button variant="ghost" onClick={() => setActiveContractUrl(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <iframe 
                src={activeContractUrl} 
                className="w-full h-full min-h-[500px] border rounded"
                title="Contract PDF"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signature Modal */}
      {signingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signature className="h-5 w-5" />
                Sign Contract
              </CardTitle>
              <CardDescription>
                Draw your signature in the box below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="border rounded w-full bg-white cursor-crosshair"
                  onMouseDown={startDrawing}
                />
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Click and drag to draw your signature
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={clearSignature}
                >
                  Clear
                </Button>
                <Button 
                  onClick={() => signContract(signingId!)}
                  disabled={isSigning === signingId}
                >
                  {isSigning === signingId ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Submit Signature
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSigningId(null)
                    clearSignature()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Terms Modal */}
      <dialog id="custom-terms-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Custom Contract Terms</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-terms">Additional Terms & Conditions</Label>
              <textarea
                id="custom-terms"
                value={customTerms}
                onChange={(e) => setCustomTerms(e.target.value)}
                className="w-full h-32 p-2 border rounded mt-1"
                placeholder="Enter any custom terms or special conditions for this contract..."
              />
            </div>
            <div className="modal-action">
              <Button
                variant="outline"
                onClick={() => {
                  const modal = document.getElementById('custom-terms-modal') as HTMLDialogElement
                  modal?.close()
                  setCustomTerms("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const modal = document.getElementById('custom-terms-modal') as HTMLDialogElement
                  const bookingId = modal?.getAttribute('data-booking-id')
                  if (bookingId) {
                    generateContract(bookingId, customTerms)
                  }
                  modal?.close()
                }}
              >
                Generate with Custom Terms
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  )
}