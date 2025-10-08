// Centralized API types matching PhotoBooking Platform - Complete API Guide v1.0

export type Role = "CLIENT" | "PHOTOGRAPHER" | "ADMIN"

export interface PaginatedResponse<T> {
  items: T[]
  meta?: {
    total?: number
    page?: number
    perPage?: number
    pages?: number
    unreadCount?: number
  }
}

export interface StateModel {
  id: string
  code: string
  name: string
}

export interface ServiceModel {
  id: string
  name: string
  slug: string
  description?: string
  categoryId?: string
}

export interface PortfolioImage {
  id: string
  url: string
}

export interface PortfolioModel {
  id: string
  title: string
  images?: PortfolioImage[]
}

export interface PhotographerModel {
  id: string
  user: { id: string; name: string; email?: string }
  bio?: string
  priceBaseline?: number
  ratingAvg?: number
  ratingCount?: number
  services?: ServiceModel[]
  state?: StateModel
  portfolios?: PortfolioModel[]
  tags?: string[]
  verified?: boolean
  isFavorited?: boolean
}

export interface BookingModel {
  id: string
  clientId?: string
  photographerId: string
  packageId?: string | null
  startAt: string
  endAt: string
  location?: { address: string; lat: number; lon: number }
  priceCents?: number
  state: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  client?: { id: string; name: string; email?: string }
  photographer?: { id: string; user: { id: string; name: string } }
}

export interface ConversationModel {
  id: string
  otherUser?: { id: string; name: string }
  lastActiveAt?: string
  lastMessage?: MessageModel
  unreadCount?: number
}

export interface MessageAttachment {
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
}

export interface MessageModel {
  id: string
  conversationId?: string
  senderId: string
  content?: string
  attachments?: MessageAttachment[]
  readAt?: string | null
  createdAt: string
  sender?: { id: string; name: string }
}

export interface NotificationModel {
  id: string
  userId: string
  type: string
  payload?: any
  readAt?: string | null
  createdAt: string
}

export interface ContractModel {
  id: string
  bookingId: string
  status: "GENERATED" | "SIGNED"
  pdfUrl: string
  signedAt?: string | null
  createdAt: string
}

export interface ReviewModel {
  id: string
  bookingId: string
  photographerId: string
  reviewerId: string
  rating: number
  text?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}


