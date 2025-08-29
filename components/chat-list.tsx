"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ChatConversation } from "@/lib/chat-data"

interface ChatListProps {
  conversations: ChatConversation[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  currentUserRole: "client" | "photographer"
}

export function ChatList({ conversations, selectedChatId, onSelectChat, currentUserRole }: ChatListProps) {
  const formatTime = (date: Date) => {
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
        const otherUser =
          currentUserRole === "client"
            ? { name: conversation.photographerName, avatar: conversation.photographerAvatar }
            : { name: conversation.clientName, avatar: conversation.clientAvatar }

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
                  <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
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
                    <span className="text-xs text-muted-foreground">{formatTime(conversation.lastMessageTime)}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{conversation.projectType}</p>

                  <p className="text-sm text-muted-foreground truncate mb-2">{conversation.lastMessage}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {conversation.status}
                    </Badge>
                    {conversation.unreadCount > 0 && (
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
