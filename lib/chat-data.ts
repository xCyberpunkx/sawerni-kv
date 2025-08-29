export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: "client" | "photographer"
  content: string
  timestamp: Date
  type: "text" | "price_proposal" | "image" | "booking_request"
  priceProposal?: {
    amount: number
    currency: string
    description: string
    status: "pending" | "accepted" | "rejected"
  }
  imageUrl?: string
}

export interface ChatConversation {
  id: string
  clientId: string
  clientName: string
  clientAvatar: string
  photographerId: string
  photographerName: string
  photographerAvatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  status: "active" | "archived"
  projectType: string
  messages: ChatMessage[]
}

export const mockChatData: ChatConversation[] = [
  {
    id: "1",
    clientId: "client1",
    clientName: "Amina Benali",
    clientAvatar: "/happy-algerian-bride-smiling.png",
    photographerId: "photographer1",
    photographerName: "Omar Khelifi",
    photographerAvatar: "/professional-algerian-businessman-headshot.png",
    lastMessage: "I can offer you a special package for 45,000 DA",
    lastMessageTime: new Date("2024-01-15T14:30:00"),
    unreadCount: 2,
    status: "active",
    projectType: "Wedding Photography",
    messages: [
      {
        id: "m1",
        senderId: "client1",
        senderName: "Amina Benali",
        senderRole: "client",
        content:
          "Hi Omar! I saw your portfolio and I'm interested in booking you for my wedding on March 15th. Could you tell me about your wedding packages?",
        timestamp: new Date("2024-01-15T10:00:00"),
        type: "text",
      },
      {
        id: "m2",
        senderId: "photographer1",
        senderName: "Omar Khelifi",
        senderRole: "photographer",
        content:
          "Hello Amina! Congratulations on your upcoming wedding! I'd be delighted to capture your special day. Let me share some package options with you.",
        timestamp: new Date("2024-01-15T10:15:00"),
        type: "text",
      },
      {
        id: "m3",
        senderId: "photographer1",
        senderName: "Omar Khelifi",
        senderRole: "photographer",
        content: "Here's my premium wedding package proposal:",
        timestamp: new Date("2024-01-15T10:16:00"),
        type: "price_proposal",
        priceProposal: {
          amount: 50000,
          currency: "DA",
          description:
            "Premium Wedding Package: 8 hours coverage, 2 photographers, 500+ edited photos, online gallery, USB drive with all photos",
          status: "pending",
        },
      },
      {
        id: "m4",
        senderId: "client1",
        senderName: "Amina Benali",
        senderRole: "client",
        content:
          "Thank you for the detailed proposal! The package looks great, but I was hoping for something closer to 40,000 DA. Would that be possible?",
        timestamp: new Date("2024-01-15T12:00:00"),
        type: "text",
      },
      {
        id: "m5",
        senderId: "photographer1",
        senderName: "Omar Khelifi",
        senderRole: "photographer",
        content: "I understand your budget concerns. Let me offer you a customized package:",
        timestamp: new Date("2024-01-15T14:30:00"),
        type: "price_proposal",
        priceProposal: {
          amount: 45000,
          currency: "DA",
          description:
            "Custom Wedding Package: 6 hours coverage, 1 main photographer + assistant, 300+ edited photos, online gallery",
          status: "pending",
        },
      },
    ],
  },
  {
    id: "2",
    clientId: "client2",
    clientName: "Yacine Meziani",
    clientAvatar: "/professional-algerian-businessman-headshot.png",
    photographerId: "photographer2",
    photographerName: "Fatima Boudiaf",
    photographerAvatar: "/professional-algerian-woman-event-planner.png",
    lastMessage: "Perfect! I'll prepare the contract for the corporate event.",
    lastMessageTime: new Date("2024-01-14T16:45:00"),
    unreadCount: 0,
    status: "active",
    projectType: "Corporate Event",
    messages: [
      {
        id: "m6",
        senderId: "client2",
        senderName: "Yacine Meziani",
        senderRole: "client",
        content:
          "Hi Fatima, I need a photographer for our company's annual conference on February 20th. It's a full-day event with about 200 attendees.",
        timestamp: new Date("2024-01-14T14:00:00"),
        type: "text",
      },
      {
        id: "m7",
        senderId: "photographer2",
        senderName: "Fatima Boudiaf",
        senderRole: "photographer",
        content:
          "Hello Yacine! I specialize in corporate events and would love to help. Here's my proposal for your conference:",
        timestamp: new Date("2024-01-14T14:30:00"),
        type: "price_proposal",
        priceProposal: {
          amount: 35000,
          currency: "DA",
          description:
            "Corporate Event Package: Full day coverage (8 hours), keynote speakers, networking sessions, group photos, 200+ edited photos, same-day highlights reel",
          status: "accepted",
        },
      },
      {
        id: "m8",
        senderId: "client2",
        senderName: "Yacine Meziani",
        senderRole: "client",
        content: "This looks perfect for our needs! I accept your proposal. When can we finalize the details?",
        timestamp: new Date("2024-01-14T15:30:00"),
        type: "text",
      },
      {
        id: "m9",
        senderId: "photographer2",
        senderName: "Fatima Boudiaf",
        senderRole: "photographer",
        content:
          "Perfect! I'll prepare the contract for the corporate event. I'll send it over by tomorrow with all the details we discussed.",
        timestamp: new Date("2024-01-14T16:45:00"),
        type: "text",
      },
    ],
  },
]

export function getChatById(chatId: string): ChatConversation | undefined {
  return mockChatData.find((chat) => chat.id === chatId)
}

export function getChatsByUserId(userId: string, userRole: "client" | "photographer"): ChatConversation[] {
  return mockChatData.filter((chat) =>
    userRole === "client" ? chat.clientId === userId : chat.photographerId === userId,
  )
}
