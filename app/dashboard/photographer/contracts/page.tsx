"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface BookingItem {
  id: string
  client?: { id: string; name: string; email?: string }
  state: string
  startAt: string
  endAt: string
  contract?: { id: string; status: string; pdfUrl?: string; signedAt?: string }
}

export default function ContractsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeContractUrl, setActiveContractUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [signingId, setSigningId] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await Api.get<{ items: any[] }>("/bookings/received?page=1&perPage=50")
        // If backend includes contract info in booking, keep it; otherwise we only manage generate/sign flows
        setBookings(res.items as any)
      } catch (e: any) {
        setError(e?.message || "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const generateContract = async (bookingId: string) => {
    try {
      const res = await Api.post<any>("/contracts/generate", { bookingId })
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, contract: res.contract } : b)))
      if (res.contract?.pdfUrl) setActiveContractUrl(res.contract.pdfUrl)
    } catch (e: any) {
      setError(e?.message || "Failed to generate contract")
    }
  }

  const signContract = async (contractId: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    try {
      const res = await Api.post<any>(`/contracts/${contractId}/sign`, { signatureDataUrl: dataUrl })
      setBookings((prev) => prev.map((b) => (b.contract?.id === contractId ? { ...b, contract: res } : b)))
      setSigningId(null)
    } catch (e: any) {
      setError(e?.message || "Failed to sign contract")
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.beginPath()
    const rect = canvas.getBoundingClientRect()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    const move = (ev: MouseEvent) => {
      ctx.lineTo(ev.clientX - rect.left, ev.clientY - rect.top)
      ctx.stroke()
    }
    const up = () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">Generate and sign booking contracts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Booking #{b.id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(b.startAt).toLocaleString()}</div>
                    </div>
                    <Badge variant="secondary">{b.state}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {!b.contract ? (
                      <Button size="sm" onClick={() => generateContract(b.id)}>Generate Contract</Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="bg-transparent" onClick={() => setActiveContractUrl(b.contract?.pdfUrl || null)}>
                          View PDF
                        </Button>
                        {b.contract.status !== "SIGNED" && (
                          <Button size="sm" onClick={() => setSigningId(b.contract!.id)}>Sign</Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No bookings.</div>
          )}
        </CardContent>
      </Card>

      {activeContractUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Contract PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe src={activeContractUrl} className="w-full h-[600px] border rounded" />
          </CardContent>
        </Card>
      )}

      {signingId && (
        <Card>
          <CardHeader>
            <CardTitle>Sign Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="border rounded w-full h-[200px]"
                onMouseDown={startDrawing}
              />
              <div className="flex gap-2">
                <Button onClick={() => signContract(signingId!)}>Submit Signature</Button>
                <Button variant="outline" className="bg-transparent" onClick={clearSignature}>Clear</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


