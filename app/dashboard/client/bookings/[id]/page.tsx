"use client"

import { useParams } from "next/navigation"
import { useBooking, useUpdateBookingState, useGenerateContract, useSignContract } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, X, StopCircle, FileText, Download } from "lucide-react"
import { useState } from "react"

const stateColor: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled_by_client: "bg-red-100 text-red-800",
  cancelled_by_photographer: "bg-red-100 text-red-800",
}

export default function BookingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: bk, isLoading, error } = useBooking(id)
  const updateState = useUpdateBookingState(id)
  const genContract = useGenerateContract()
  const signContract = useSignContract()
  const [contractId, setContractId] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const onCancel = () => updateState.mutate({ toState: "cancelled_by_client" })
  const onConfirm = () => updateState.mutate({ toState: "confirmed" })
  const onComplete = () => updateState.mutate({ toState: "completed" })
  const onGenerateContract = async () => {
    if (!bk?.id) return
    const res: any = await genContract.mutateAsync(bk.id)
    const c = res?.contract
    if (c?.id) setContractId(c.id)
    if (c?.pdfUrl) setPdfUrl(c.pdfUrl)
  }
  const onSignContract = async () => {
    // In a real UI, capture a signature from a canvas. Here, send a small dot PNG as data URL placeholder.
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+v+o5VwAAAABJRU5ErkJggg=="
    const targetId = contractId || id
    await signContract.mutateAsync({ id: targetId, signatureDataUrl: tinyPng, signerName: "Client" })
  }
  const onDownload = () => {
    const url = pdfUrl || (contractId ? `/contracts/${contractId}/download` : "")
    if (!url) return
    // If backend expects full URL, open absolute; if relative endpoint, open API base path
    window.open(url.startsWith("http") ? url : `${location.origin}${url}`, "_blank")
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !bk) return <div className="p-6 text-red-600">Failed to load booking</div>

  const color = stateColor[bk.state] || "bg-muted text-foreground"
  const dateStr = new Date(bk.startAt).toLocaleString()

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {bk.photographer?.user?.name || "Photographer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{dateStr}</div>
            <Badge className={color}>{bk.state.replaceAll("_", " ")}</Badge>
          </div>
          <div className="text-sm">
            <div>Location: {bk.location?.address || "—"}</div>
            <div>Price: {bk.priceCents ? `${(bk.priceCents / 100).toLocaleString()} DA` : "—"}</div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {bk.state === "requested" && (
              <>
                <Button size="sm" variant="outline" onClick={onCancel} disabled={updateState.isPending}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </>
            )}

            {bk.state === "confirmed" && (
              <>
                <Button size="sm" onClick={onComplete} disabled={updateState.isPending}>
                  <StopCircle className="h-4 w-4 mr-1" /> Mark completed
                </Button>
                <Button size="sm" variant="outline" onClick={onGenerateContract} disabled={genContract.isPending}>
                  <FileText className="h-4 w-4 mr-1" /> Generate contract
                </Button>
                <Button size="sm" variant="outline" onClick={onSignContract} disabled={signContract.isPending}>
                  <Check className="h-4 w-4 mr-1" /> Sign contract
                </Button>
                {(pdfUrl || contractId) && (
                  <Button size="sm" variant="outline" onClick={onDownload}>
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                )}
              </>
            )}

            {bk.state === "in_progress" && (
              <Button size="sm" onClick={onComplete} disabled={updateState.isPending}>
                <Check className="h-4 w-4 mr-1" /> Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


