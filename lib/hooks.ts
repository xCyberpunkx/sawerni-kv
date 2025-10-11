"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Api } from "./api"
import type {
  PaginatedResponse,
  PhotographerModel,
  BookingModel,
  ConversationModel,
  NotificationModel,
  ReviewModel,
  ContractModel,
} from "./api-types"

// Query Keys
const qk = {
  photographers: (params?: string) => ["photographers", params ?? ""] as const,
  favorites: ["favorites"] as const,
  bookings: (page = 1, perPage = 20) => ["bookings", page, perPage] as const,
  booking: (id: string) => ["booking", id] as const,
  conversations: (page = 1, perPage = 20) => ["conversations", page, perPage] as const,
  messages: (conversationId: string, page = 1, perPage = 50) => ["messages", conversationId, page, perPage] as const,
  notifications: (page = 1, perPage = 20) => ["notifications", page, perPage] as const,
  reviewsMe: (page = 1, perPage = 50) => ["reviewsMe", page, perPage] as const,
  photographerPackages: (id: string) => ["packages", id] as const,
  photographerGallery: (id: string) => ["gallery", id] as const,
  photographerCalendar: (id: string, from?: string, to?: string) => ["calendar", id, from ?? "", to ?? ""] as const,
}

// Photographers
export function usePhotographers(queryString: string) {
  return useQuery({
    queryKey: qk.photographers(queryString),
    queryFn: async () => Api.get<PaginatedResponse<PhotographerModel>>(`/photographers?${queryString}`),
  })
}

// Favorites
export function useFavorites(page = 1, perPage = 12) {
  return useQuery({
    queryKey: qk.favorites,
    queryFn: async () => Api.get<{ items: any[]; meta?: any }>(`/favorites?page=${page}&perPage=${perPage}`),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { photographerId: string; isFav: boolean }) => {
      if (args.isFav) {
        return Api.delete(`/favorites/${args.photographerId}`)
      }
      return Api.post(`/favorites/${args.photographerId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.favorites })
      qc.invalidateQueries({ queryKey: ["photographers"] })
    },
  })
}

// Bookings
export function useBookings(page = 1, perPage = 20) {
  return useQuery({
    queryKey: qk.bookings(page, perPage),
    queryFn: async () => Api.get<PaginatedResponse<BookingModel>>(`/bookings/me?page=${page}&perPage=${perPage}`),
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: qk.booking(id),
    queryFn: async () => Api.get<BookingModel>(`/bookings/${id}`),
    enabled: !!id,
  })
}

export function useUpdateBookingState(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { toState: string; reason?: string }) => Api.patch(`/bookings/${id}/state`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.booking(id) })
      qc.invalidateQueries({ queryKey: ["calendar"] })
      qc.invalidateQueries({ queryKey: qk.bookings(1, 20) })
    },
  })
}

// Conversations
export function useConversations(page = 1, perPage = 20) {
  return useQuery({
    queryKey: qk.conversations(page, perPage),
    queryFn: async () => Api.get<PaginatedResponse<ConversationModel>>(`/conversations?page=${page}&perPage=${perPage}`),
  })
}

export function useMessages(conversationId: string, page = 1, perPage = 50) {
  return useQuery({
    queryKey: qk.messages(conversationId, page, perPage),
    queryFn: async () => Api.get(`/conversations/${conversationId}/messages?page=${page}&perPage=${perPage}`),
    enabled: !!conversationId,
  })
}

// Notifications
export function useNotifications(page = 1, perPage = 20) {
  return useQuery({
    queryKey: qk.notifications(page, perPage),
    queryFn: async () => Api.get<PaginatedResponse<NotificationModel>>(`/notifications/me?page=${page}&perPage=${perPage}`),
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => Api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications(1, 20) }),
  })
}

// Reviews
export function useReviewsMe(page = 1, perPage = 50) {
  return useQuery({
    queryKey: qk.reviewsMe(page, perPage),
    queryFn: async () => Api.get<PaginatedResponse<ReviewModel>>(`/reviews/me?page=${page}&perPage=${perPage}`),
  })
}

// Contracts
export function useGenerateContract() {
  return useMutation({
    mutationFn: async (bookingId: string) => Api.post(`/contracts/generate`, { bookingId }),
  })
}

export function useSignContract() {
  return useMutation({
    mutationFn: async (args: { id: string; signatureDataUrl: string; signerName?: string }) =>
      Api.post(`/contracts/${args.id}/sign`, {
        signatureDataUrl: args.signatureDataUrl,
        signerName: args.signerName,
      }),
  })
}

// Photographer assets
export function usePhotographerPackages(id: string) {
  return useQuery({
    queryKey: qk.photographerPackages(id),
    queryFn: async () => Api.get(`/packages/photographer/${id}`),
    enabled: !!id,
  })
}

export function usePhotographerGallery(id: string) {
  return useQuery({
    queryKey: qk.photographerGallery(id),
    queryFn: async () => Api.get(`/gallery/photographer/${id}`),
    enabled: !!id,
  })
}

export function usePhotographerCalendar(id: string, from?: string, to?: string) {
  const qs = new URLSearchParams()
  if (from) qs.set("from", from)
  if (to) qs.set("to", to)
  return useQuery({
    queryKey: qk.photographerCalendar(id, from, to),
    queryFn: async () => Api.get(`/calendar/photographer/${id}?${qs.toString()}`),
    enabled: !!id,
  })
}

// Additional hooks for booking details
export function usePhotographerDetails(id: string) {
  return useQuery({
    queryKey: ["photographer", id, "details"],
    queryFn: async () => Api.get<PhotographerModel>(`/photographers/${id}`),
    enabled: !!id,
  })
}

export function usePhotographerReviews(id: string, page = 1, perPage = 12) {
  return useQuery({
    queryKey: ["photographer", id, "reviews", page, perPage],
    queryFn: async () => Api.get<PaginatedResponse<ReviewModel>>(`/reviews/photographer/${id}?page=${page}&perPage=${perPage}`),
    enabled: !!id,
  })
}

export function useContractStatus(id: string) {
  return useQuery({
    queryKey: ["contract", id, "status"],
    queryFn: async () => Api.get<ContractModel>(`/contracts/${id}/status`),
    enabled: !!id,
  })
}

export function usePackageDetails(id: string) {
  return useQuery({
    queryKey: ["package", id],
    queryFn: async () => Api.get(`/packages/${id}`),
    enabled: !!id,
  })
}


