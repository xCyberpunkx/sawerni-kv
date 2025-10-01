"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
interface ConversationItem {
  id: string
  otherUser?: { id: string; name: string; avatarUrl?: string }
  lastMessage?: { content?: string; createdAt?: string }
  unreadCount?: number
  lastActiveAt?: string
}

interface ChatListProps {
  conversations: ConversationItem[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  currentUserRole: "client" | "photographer"
}

export function ChatList({ conversations, selectedChatId, onSelectChat, currentUserRole }: ChatListProps) {
  const formatTime = (dateInput: Date | string | undefined) => {
    if (!dateInput) return ""
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser || { name: "User", avatarUrl: undefined }

        const isSelected = selectedChatId === conversation.id

        return (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelectChat(conversation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser.avatarUrl || "/placeholder.svg"} alt={otherUser.name} />
                  <AvatarFallback>
                    {otherUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate">{otherUser.name}</h4>
                    <span className="text-xs text-muted-foreground">{formatTime(conversation.lastMessage?.createdAt || conversation.lastActiveAt)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground truncate mb-2">{conversation.lastMessage?.content || ""}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {conversation.unreadCount && conversation.unreadCount > 0 ? "unread" : "read"}
                    </Badge>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <Badge className="bg-accent text-accent-foreground text-xs">{conversation.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
