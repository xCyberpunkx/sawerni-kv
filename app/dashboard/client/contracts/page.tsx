"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Download, FileText, Loader2, Search, Signature } from "lucide-react"

type BookingItem = {
  id: string
  startAt: string
  endAt: string
  state: string
  photographer?: { id: string; user?: { id: string; name: string } }
  contract?: { id: string; status: string; pdfUrl?: string; signedAt?: string | null }
}

export default function ClientContractsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<{ items: any[] }>("/bookings/me?page=1&perPage=100")
      setBookings(res.items as any)
    } catch (e: any) {
      setError(e?.message || "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const generateContract = async (bookingId: string) => {
    setIsGenerating(bookingId)
    try {
      const res = await Api.post<any>("/contracts/generate", { bookingId })
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, contract: res.contract } : b)))
    } catch (e: any) {
      setError(e?.message || "Failed to generate contract")
    } finally {
      setIsGenerating(null)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#111827"
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const signContract = async (contractId: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // ensure non-empty
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const isEmpty = imageData.data.every((v) => v === 0)
      if (isEmpty) {
        setError("Please provide a signature")
        return
      }
    }

    setIsSigning(contractId)
    try {
      const dataUrl = canvas.toDataURL("image/png")
      const res = await Api.post<any>(`/contracts/${contractId}/sign`, { signatureDataUrl: dataUrl })
      setBookings((prev) =>
        prev.map((b) => (b.contract?.id === contractId ? { ...b, contract: { ...res, status: "SIGNED" } } : b)),
      )
      clearSignature()
    } catch (e: any) {
      setError(e?.message || "Failed to sign contract")
    } finally {
      setIsSigning(null)
    }
  }

  const downloadContract = (contractId: string, url?: string) => {
    const finalUrl = url && url.startsWith("http") ? url : `/contracts/${contractId}/download`
    window.open(finalUrl, "_blank")
  }

  const filtered = useMemo(() => {
    if (!searchQuery) return bookings
    const q = searchQuery.toLowerCase()
    return bookings.filter((b) => {
      const name = b.photographer?.user?.name || ""
      return name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
    })
  }, [bookings, searchQuery])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" /> Contracts
        </h1>
        <div className="relative w-72">
          <Input
            placeholder="Search by photographer or booking ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {loading && <div>Loading...</div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending and Signed Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-muted-foreground text-sm">No bookings found.</div>
          )}
          {filtered.map((b) => {
            const photographerName = b.photographer?.user?.name || "Photographer"
            const dateStr = new Date(b.startAt).toLocaleString()
            const hasContract = !!b.contract
            const isSigned = b.contract?.status === "SIGNED"
            return (
              <div key={b.id} className="flex items-center gap-4 p-4 border rounded-xl">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={"/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {photographerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{photographerName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{dateStr}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasContract ? (
                    <Badge variant={isSigned ? "secondary" : "outline"}>{isSigned ? "Signed" : "Generated"}</Badge>
                  ) : (
                    <Badge variant="outline">No Contract</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!hasContract && (
                    <Button size="sm" onClick={() => generateContract(b.id)} disabled={!!isGenerating}>
                      {isGenerating === b.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Generate
                    </Button>
                  )}
                  {hasContract && (
                    <>
                      {!isSigned && (
                        <Button size="sm" variant="default" onClick={() => signContract(b.contract!.id)} disabled={!!isSigning}>
                          {isSigning === b.contract!.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Signature className="mr-2 h-4 w-4" />
                          )}
                          Sign
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => downloadContract(b.contract!.id, b.contract?.pdfUrl)}>
                        <Download className="mr-2 h-4 w-4" /> PDF
                      </Button>
                    </>
                  )}
                  <Link href={`/dashboard/client/bookings/${b.id}`}>
                    <Button size="sm" variant="ghost">Details</Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Signature className="h-5 w-5" /> Draw Your Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-md p-3 bg-muted/30">
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-44 bg-white rounded-md border"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={clearSignature}>Clear</Button>
            <p className="text-xs text-muted-foreground self-center">Sign above, then click Sign on a contract.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


