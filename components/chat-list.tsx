// components/chat-list.tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar?: string
    online?: boolean
  }
  lastActiveAt: string
  lastMessage?: {
    id: string
    content: string | null
    createdAt: string
    senderId: string
    sender: {
      id: string
      name: string
    }
    attachments?: any[]
  }
  unreadCount: number
  messages?: any[]
}

interface ChatListProps {
  conversations: Conversation[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  currentUserRole: string
}

export function ChatList({ conversations, selectedChatId, onSelectChat, currentUserRole }: ChatListProps) {
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm')
    } catch {
      return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()
      
      if (isToday) {
        return format(date, 'HH:mm')
      } else if (isYesterday) {
        return 'Yesterday'
      } else {
        return format(date, 'dd/MM/yy')
      }
    } catch {
      return "Unknown"
    }
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return "No messages yet"
    }

    const { lastMessage } = conversation
    
    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      const attachmentCount = lastMessage.attachments.length
      if (lastMessage.attachments[0].mimetype?.startsWith('image/')) {
        return `📷 ${attachmentCount} image${attachmentCount > 1 ? 's' : ''}`
      } else {
        return `📎 ${attachmentCount} file${attachmentCount > 1 ? 's' : ''}`
      }
    }

    return lastMessage.content || "Message"
  }

  const getSenderPrefix = (conversation: Conversation) => {
    if (!conversation.lastMessage) return ""
    
    // Don't show prefix for current user's messages
    if (conversation.lastMessage.senderId === conversation.otherUser.id) {
      return ""
    }
    
    return "You: "
  }

  return (
    <div className="space-y-2 p-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={`p-3 cursor-pointer transition-colors ${
            selectedChatId === conversation.id
              ? "bg-muted border-primary"
              : "hover:bg-muted/50"
          }`}
          onClick={() => onSelectChat(conversation.id)}
        >
          <div className="flex items-center gap-3">
            {/* Avatar with online indicator */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.otherUser.avatar} />
                <AvatarFallback>
                  {conversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {conversation.otherUser.online && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm truncate">
                  {conversation.otherUser.name}
                </h4>
                <div className="flex items-center gap-1">
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  <span className="text-xs">
                    {getSenderPrefix(conversation)}
                  </span>
                  {getLastMessagePreview(conversation)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}