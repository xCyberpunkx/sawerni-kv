let socketInstance: any = null

type Handlers = {
  onNotification?: (notification: any) => void
  onNotificationRead?: (data: any) => void
  onMessage?: (message: any) => void
  onBookingStateChanged?: (booking: any) => void
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


