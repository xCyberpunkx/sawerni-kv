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

// Demo login credentials
export const demoCredentials = {
  client: { email: "client@sawerni.dz", password: "demo123" },
  photographer: { email: "photographer@sawerni.dz", password: "demo123" },
  admin: { email: "admin@sawerni.dz", password: "demo123" },
}

// Demo users
export const demoUsers: User[] = [
  {
    id: "1",
    name: "Ahmed Ben Ali",
    email: "client@sawerni.dz",
    role: "client",
    avatar: "/algerian-man-profile.png",
    state: "Algiers",
    phone: "+213 555 123 456",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Fatima Zahra",
    email: "photographer@sawerni.dz",
    role: "photographer",
    avatar: "/algerian-woman-photographer.png",
    state: "Oran",
    serviceType: "Wedding photography",
    bio: "Professional photographer specialized in weddings and private events",
    phone: "+213 555 789 012",
    joinedDate: "2023-08-20",
  },
  {
    id: "3",
    name: "Mohamed El Amine",
    email: "admin@sawerni.dz",
    role: "admin",
    avatar: "/algerian-man-admin.png",
    joinedDate: "2023-01-01",
  },
]

// Demo photographers
export const demoPhotographers: Photographer[] = [
  {
    id: "2",
    name: "Fatima Zahra",
    email: "photographer@sawerni.dz",
    role: "photographer",
    avatar: "/algerian-woman-photographer.png",
    state: "Oran",
    serviceType: "Wedding photography",
    bio: "Professional photographer specialized in weddings and private events",
    phone: "+213 555 789 012",
    joinedDate: "2023-08-20",
    portfolio: [
      "/algerian-wedding-photography.png",
      "/traditional-algerian-ceremony.png",
      "/family-portrait-algeria.png",
      "/engagement-photos-algeria.png",
    ],
    packages: [
      {
        id: "pkg1",
        name: "Basic wedding package",
        description: "Wedding day coverage with 100 edited photos",
        price: 50000,
        duration: "8 hours",
        includes: ["100 edited photos", "Digital album", "Ceremony coverage"],
      },
      {
        id: "pkg2",
        name: "Golden wedding package",
        description: "Full coverage with video and printed album",
        price: 80000,
        duration: "10 hours",
        includes: ["200 edited photos", "Short video", "Printed album", "Pre-wedding shoot"],
      },
    ],
    rating: 4.8,
    reviewCount: 24,
    completedBookings: 45,
    specialties: ["Wedding photography", "Traditional photography", "Family photography"],
    priceRange: "30,000 - 100,000 DA",
    availability: true,
  },
  {
    id: "4",
    name: "Youssef Ben Mohamed",
    email: "youssef@sawerni.dz",
    role: "photographer",
    avatar: "/algerian-male-photographer.png",
    state: "Constantine",
    serviceType: "Photography",
    bio: "Professional photographer specialized in nature and portrait photography",
    phone: "+213 555 345 678",
    joinedDate: "2023-06-10",
    portfolio: [
      "/nature-photography-algeria.png",
      "/portrait-photography-algeria.png",
      "/landscape-algeria-mountains.png",
      "/street-photography-algeria.png",
    ],
    packages: [
      {
        id: "pkg3",
        name: "Personal photo session",
        description: "Professional portrait photo session",
        price: 15000,
        duration: "2 hours",
        includes: ["30 edited photos", "Studio or outdoor session"],
      },
      {
        id: "pkg4",
        name: "Event photography",
        description: "Photography for events and occasions",
        price: 25000,
        duration: "4 hours",
        includes: ["80 edited photos", "Full event coverage"],
      },
    ],
    rating: 4.6,
    reviewCount: 18,
    completedBookings: 32,
    specialties: ["Nature photography", "Portrait", "Street photography"],
    priceRange: "10,000 - 40,000 DA",
    availability: true,
  },
]

// Demo bookings
export const demoBookings: Booking[] = [
  {
    id: "book1",
    clientId: "1",
    photographerId: "2",
    packageId: "pkg1",
    date: "2024-12-15",
    status: "confirmed",
    location: "El Aurassi Hotel, Algiers",
    notes: "Traditional Algerian wedding",
    totalAmount: 50000,
  },
  {
    id: "book2",
    clientId: "1",
    photographerId: "4",
    packageId: "pkg3",
    date: "2024-11-20",
    status: "completed",
    location: "Botanical Garden of Hamma, Algiers",
    totalAmount: 15000,
  },
]

// Demo messages
export const demoMessages: Message[] = [
  {
    id: "msg1",
    senderId: "1",
    receiverId: "2",
    content: "Hello, I would like to book a photo session for my wedding",
    timestamp: "2024-11-10T10:30:00Z",
    read: true,
  },
  {
    id: "msg2",
    senderId: "2",
    receiverId: "1",
    content: "Welcome! I would be happy to photograph your wedding. What date do you need?",
    timestamp: "2024-11-10T10:45:00Z",
    read: true,
  },
]

// Demo reviews
export const demoReviews: Review[] = [
  {
    id: "rev1",
    clientId: "1",
    photographerId: "2",
    bookingId: "book2",
    rating: 5,
    comment: "Amazing and professional photography, highly recommended!",
    date: "2024-11-25",
  },
]
