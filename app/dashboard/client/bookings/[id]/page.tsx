"use client"

import { useParams } from "next/navigation"
import { 
  useBooking, 
  useUpdateBookingState, 
  useGenerateContract, 
  useSignContract,
  usePhotographerDetails,
  usePhotographerReviews,
  useContractStatus,
  usePackageDetails,
  usePhotographerGallery
} from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Check, 
  X, 
  StopCircle, 
  FileText, 
  Download, 
  MapPin, 
  Clock, 
  Star, 
  User, 
  MessageCircle,
  Camera,
  Package,
  History,
  Phone,
  Mail,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Api } from "@/lib/api" // Import the Api utility
import { toast } from "sonner" // Import toast for notifications
import { useRouter } from "next/navigation" // Import router for navigation

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
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const router = useRouter()

  // Additional data hooks
  const { data: photographerDetails } = usePhotographerDetails(bk?.photographerId || "")
  const { data: photographerReviews } = usePhotographerReviews(bk?.photographerId || "")
  const { data: contractStatus } = useContractStatus(contractId || "")
  const { data: packageDetails } = usePackageDetails(bk?.packageId || "")
  const { data: photographerGallery } = usePhotographerGallery(bk?.photographerId || "")

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
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+v+o5VwAAAABJRU5ErkJggg=="
    const targetId = contractId || id
    await signContract.mutateAsync({ id: targetId, signatureDataUrl: tinyPng, signerName: "Client" })
  }
  
  const onDownload = () => {
    const url = pdfUrl || (contractId ? `/contracts/${contractId}/download` : "")
    if (!url) return
    window.open(url.startsWith("http") ? url : `${location.origin}${url}`, "_blank")
  }

  // Function to create conversation and redirect to messages
  const handleMessagePhotographer = async () => {
    if (!bk?.photographer?.user?.id) {
      toast.error("Photographer information not available")
      return
    }

    setIsCreatingConversation(true)
    try {
      // Create conversation using the API
      const response = await Api.post("/conversations", {
        participantId: bk.photographer.user.id
      })

      // Redirect to messages page with the new conversation
      router.push("/dashboard/client/messages")
      toast.success("Conversation created successfully")
      
    } catch (error: any) {
      console.error("Failed to create conversation:", error)
      toast.error(error?.message || "Failed to start conversation")
    } finally {
      setIsCreatingConversation(false)
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !bk) return <div className="p-6 text-red-600">Failed to load booking</div>

  const color = stateColor[bk.state] || "bg-muted text-foreground"
  const startDate = new Date(bk.startAt)
  const endDate = new Date(bk.endAt)
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Booking Details
            </CardTitle>
            <Badge className={color}>{bk.state.replaceAll("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date & Time:</span>
                <span>{startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Duration:</span>
                <span>{duration} hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{bk.location?.address || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Price:</span>
                <span className="text-lg font-semibold text-green-600">
                  {bk.priceCents ? `${(bk.priceCents / 100).toLocaleString()} DA` : "—"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Photographer:</span>
                <span>{bk.photographer?.user?.name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created:</span>
                <span>{bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : "—"}</span>
              </div>
              {bk.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span>
                  <p className="text-muted-foreground mt-1">{bk.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            {bk.state === "requested" && (
              <Button size="sm" variant="outline" onClick={onCancel} disabled={updateState.isPending}>
                <X className="h-4 w-4 mr-1" /> Cancel Booking
              </Button>
            )}

            {bk.state === "confirmed" && (
              <>
                <Button size="sm" onClick={onComplete} disabled={updateState.isPending}>
                  <StopCircle className="h-4 w-4 mr-1" /> Mark Completed
                </Button>
                <Button size="sm" variant="outline" onClick={onGenerateContract} disabled={genContract.isPending}>
                  <FileText className="h-4 w-4 mr-1" /> Generate Contract
                </Button>
                <Button size="sm" variant="outline" onClick={onSignContract} disabled={signContract.isPending}>
                  <Check className="h-4 w-4 mr-1" /> Sign Contract
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

            {bk.state === "completed" && !bk.review && (
              <Button size="sm" onClick={() => setShowReviewForm(true)}>
                <Star className="h-4 w-4 mr-1" /> Write Review
              </Button>
            )}

            {/* Updated Message Photographer Button */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleMessagePhotographer}
              disabled={isCreatingConversation}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {isCreatingConversation ? "Creating Conversation..." : "Message Photographer"}
            </Button>
          </div>
        </CardContent>
      </Card>

  {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="photographer">Photographer</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          {bk.state === "completed" && <TabsTrigger value="review">Review</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Details */}
            {packageDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">{packageDetails.title}</h4>
                    {packageDetails.description && (
                      <p className="text-sm text-muted-foreground">{packageDetails.description}</p>
                    )}
                    <div className="text-lg font-semibold text-green-600">
                      {(packageDetails.priceCents / 100).toLocaleString()} DA
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{bk.location?.address || "No address provided"}</p>
                  {bk.location?.lat && bk.location?.lon && (
                    <div className="text-xs text-muted-foreground">
                      Coordinates: {bk.location.lat.toFixed(6)}, {bk.location.lon.toFixed(6)}
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="mt-2">
                    <ExternalLink className="h-4 w-4 mr-1" /> View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="photographer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photographer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Photographer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photographerDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback>{photographerDetails.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{photographerDetails.user.name}</h3>
                        {photographerDetails.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                    
                    {photographerDetails.bio && (
                      <p className="text-sm text-muted-foreground">{photographerDetails.bio}</p>
                    )}
                    
                    <div className="space-y-2">
                      {photographerDetails.ratingAvg && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {photographerDetails.ratingAvg.toFixed(1)} ({photographerDetails.ratingCount} reviews)
                          </span>
                        </div>
                      )}
                      
                      {photographerDetails.priceBaseline && (
                        <div className="text-sm">
                          <span className="font-medium">Starting from:</span> {(photographerDetails.priceBaseline / 100).toLocaleString()} DA
                        </div>
                      )}
                      
                      {photographerDetails.state && (
                        <div className="text-sm">
                          <span className="font-medium">Location:</span> {photographerDetails.state.name}
                        </div>
                      )}
                    </div>

                    {photographerDetails.services && photographerDetails.services.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Services:</h4>
                        <div className="flex flex-wrap gap-1">
                          {photographerDetails.services.map((service) => (
                            <Badge key={service.id} variant="outline" className="text-xs">
                              {service.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {photographerDetails.tags && photographerDetails.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Specialties:</h4>
                        <div className="flex flex-wrap gap-1">
                          {photographerDetails.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Loading photographer details...</div>
                )}
              </CardContent>
            </Card>

            {/* Photographer Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Portfolio Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photographerGallery && photographerGallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {photographerGallery.slice(0, 4).map((image: any) => (
                      <div key={image.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={image.url} 
                          alt="Portfolio" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No portfolio images available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          {photographerReviews && photographerReviews.items && photographerReviews.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {photographerReviews.items.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.reviewer?.name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.text && (
                        <p className="text-sm text-muted-foreground">{review.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contractStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={contractStatus.status === "SIGNED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {contractStatus.status}
                      </Badge>
                    </div>
                    {contractStatus.signedAt && (
                      <div className="text-sm text-muted-foreground">
                        Signed: {new Date(contractStatus.signedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Button onClick={onDownload} variant="outline">
                      <Download className="h-4 w-4 mr-1" /> Download Contract
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No contract generated yet. Generate a contract to proceed.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Booking History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bk.stateHistory && bk.stateHistory.length > 0 ? (
                <div className="space-y-4">
                  {bk.stateHistory.map((history, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {history.fromState} → {history.toState}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {history.reason && (
                          <p className="text-sm text-muted-foreground">{history.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No state history available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {bk.state === "completed" && (
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Review & Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bk.review ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < bk.review!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <Badge variant={bk.review.status === "APPROVED" ? "default" : "secondary"}>
                        {bk.review.status}
                      </Badge>
                    </div>
                    {bk.review.text && (
                      <p className="text-sm">{bk.review.text}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Reviewed on {new Date(bk.review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : showReviewForm ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} Star{rating > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review">Review (Optional)</Label>
                      <Textarea
                        id="review"
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Submit Review</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Share your experience with this photographer</p>
                    <Button onClick={() => setShowReviewForm(true)}>
                      <Star className="h-4 w-4 mr-1" /> Write Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}