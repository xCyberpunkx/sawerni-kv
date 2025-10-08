let socketInstance: any = null

type Handlers = {
  onNotification?: (notification: any) => void
  onNotificationRead?: (data: any) => void
  onMessage?: (message: any) => void
  onBookingStateChanged?: (booking: any) => void
  onUserOnline?: (userId: string) => void
  onUserOffline?: (userId: string) => void
  onConversationCreated?: (newConversation: any) => void
}

export async function connectSocket(accessToken: string, handlers: Handlers = {}) {
  if (socketInstance) return socketInstance
  const io = (await import("socket.io-client")).io
  const socket = io("http://localhost:4000", {
    auth: { token: "Bearer " + accessToken },
    transports: ["websocket"],
  })
  if (handlers.onNotification) socket.on("notification:created", handlers.onNotification)
  if (handlers.onNotificationRead) socket.on("notification:read", handlers.onNotificationRead)
  if (handlers.onMessage) socket.on("message:received", handlers.onMessage)
  if (handlers.onBookingStateChanged) socket.on("booking:state_changed", handlers.onBookingStateChanged)
  if (handlers.onUserOnline) socket.on("user:online", handlers.onUserOnline)
  if (handlers.onUserOffline) socket.on("user:offline", handlers.onUserOffline)
  if (handlers.onConversationCreated) socket.on("conversation:created", handlers.onConversationCreated)
  socketInstance = socket
  return socket
}

export function getSocket() {
  return socketInstance
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}


