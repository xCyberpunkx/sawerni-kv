export interface User {
  id: string
  name: string
  email: string
  role: "client" | "photographer" | "admin"
  avatar?: string
  state?: string
  serviceType?: string
  bio?: string
  phone?: string
  joinedDate: string
}

export interface Photographer extends User {
  role: "photographer"
  portfolio: string[]
  packages: Package[]
  rating: number
  reviewCount: number
  completedBookings: number
  specialties: string[]
  priceRange: string
  availability: boolean
}

export interface Package {
  id: string
  name: string
  description: string
  price: number
  duration: string
  includes: string[]
}

export interface Booking {
  id: string
  clientId: string
  photographerId: string
  packageId: string
  date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  location: string
  notes?: string
  totalAmount: number
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Review {
  id: string
  clientId: string
  photographerId: string
  bookingId: string
  rating: number
  comment: string
  date: string
}

// Mock demo data removed. File left with types only to avoid accidental usage.
export {}
