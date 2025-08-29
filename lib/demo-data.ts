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
    name: "أحمد بن علي",
    email: "client@sawerni.dz",
    role: "client",
    avatar: "/algerian-man-profile.png",
    state: "الجزائر العاصمة",
    phone: "+213 555 123 456",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "فاطمة زهراء",
    email: "photographer@sawerni.dz",
    role: "photographer",
    avatar: "/algerian-woman-photographer.png",
    state: "وهران",
    serviceType: "تصوير الأعراس",
    bio: "مصورة محترفة متخصصة في تصوير الأعراس والمناسبات الخاصة",
    phone: "+213 555 789 012",
    joinedDate: "2023-08-20",
  },
  {
    id: "3",
    name: "محمد الأمين",
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
    name: "فاطمة زهراء",
    email: "photographer@sawerni.dz",
    role: "photographer",
    avatar: "/algerian-woman-photographer.png",
    state: "وهران",
    serviceType: "تصوير الأعراس",
    bio: "مصورة محترفة متخصصة في تصوير الأعراس والمناسبات الخاصة",
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
        name: "باقة الزفاف الأساسية",
        description: "تصوير يوم الزفاف مع 100 صورة معدلة",
        price: 50000,
        duration: "8 ساعات",
        includes: ["100 صورة معدلة", "ألبوم رقمي", "تصوير الحفل"],
      },
      {
        id: "pkg2",
        name: "باقة الزفاف الذهبية",
        description: "تصوير شامل مع فيديو وألبوم مطبوع",
        price: 80000,
        duration: "10 ساعات",
        includes: ["200 صورة معدلة", "فيديو قصير", "ألبوم مطبوع", "تصوير ما قبل الزفاف"],
      },
    ],
    rating: 4.8,
    reviewCount: 24,
    completedBookings: 45,
    specialties: ["تصوير الأعراس", "التصوير التقليدي", "تصوير العائلات"],
    priceRange: "30,000 - 100,000 دج",
    availability: true,
  },
  {
    id: "4",
    name: "يوسف بن محمد",
    email: "youssef@sawerni.dz",
    role: "photographer",
    avatar: "/algerian-male-photographer.png",
    state: "قسنطينة",
    serviceType: "التصوير الفوتوغرافي",
    bio: "مصور محترف متخصص في التصوير الطبيعي والبورتريه",
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
        name: "جلسة تصوير شخصية",
        description: "جلسة تصوير احترافية للبورتريه",
        price: 15000,
        duration: "2 ساعة",
        includes: ["30 صورة معدلة", "جلسة في الاستوديو أو خارجه"],
      },
      {
        id: "pkg4",
        name: "تصوير المناسبات",
        description: "تصوير المناسبات والفعاليات",
        price: 25000,
        duration: "4 ساعات",
        includes: ["80 صورة معدلة", "تغطية كاملة للمناسبة"],
      },
    ],
    rating: 4.6,
    reviewCount: 18,
    completedBookings: 32,
    specialties: ["التصوير الطبيعي", "البورتريه", "تصوير الشارع"],
    priceRange: "10,000 - 40,000 دج",
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
    location: "فندق الأوراسي، الجزائر العاصمة",
    notes: "زفاف تقليدي جزائري",
    totalAmount: 50000,
  },
  {
    id: "book2",
    clientId: "1",
    photographerId: "4",
    packageId: "pkg3",
    date: "2024-11-20",
    status: "completed",
    location: "حديقة التجارب، الجزائر العاصمة",
    totalAmount: 15000,
  },
]

// Demo messages
export const demoMessages: Message[] = [
  {
    id: "msg1",
    senderId: "1",
    receiverId: "2",
    content: "مرحبا، أريد حجز جلسة تصوير لزفافي",
    timestamp: "2024-11-10T10:30:00Z",
    read: true,
  },
  {
    id: "msg2",
    senderId: "2",
    receiverId: "1",
    content: "أهلا وسهلا! سأكون سعيدة لتصوير زفافك. ما هو التاريخ المطلوب؟",
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
    comment: "تصوير رائع ومحترف، أنصح بها بشدة!",
    date: "2024-11-25",
  },
]
