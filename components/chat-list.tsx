// components/chat-list.tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

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
}

interface ChatListProps {
  conversations: Conversation[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  currentUserRole: string
}

export function ChatList({ conversations, selectedChatId, onSelectChat, currentUserRole }: ChatListProps) {
  const formatLastActive = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Unknown time"
    }
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return "No messages yet"
    }

    const { lastMessage } = conversation
    const isCurrentUser = lastMessage.senderId === currentUserRole
    
    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      const attachmentCount = lastMessage.attachments.length
      return `${isCurrentUser ? "You" : lastMessage.sender.name} sent ${attachmentCount} attachment${attachmentCount > 1 ? 's' : ''}`
    }

    if (lastMessage.content) {
      const preview = lastMessage.content.length > 50 
        ? lastMessage.content.substring(0, 50) + '...'
        : lastMessage.content
      
      return `${isCurrentUser ? "You" : lastMessage.sender.name}: ${preview}`
    }

    return `${isCurrentUser ? "You" : lastMessage.sender.name} sent a message`
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No conversations found
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={`cursor-pointer transition-all hover:bg-accent/50 ${
            selectedChatId === conversation.id 
              ? "bg-accent border-primary/50" 
              : "bg-transparent"
          }`}
          onClick={() => onSelectChat(conversation.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={conversation.otherUser.avatar} 
                    alt={conversation.otherUser.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {conversation.otherUser.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {conversation.otherUser.online && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm truncate">
                    {conversation.otherUser.name}
                  </h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground truncate mt-1">
                  {getLastMessagePreview(conversation)}
                </p>
              </div>
            </div>

            {/* Unread Badge */}
            {conversation.unreadCount > 0 && (
              <div className="flex justify-end mt-2">
                <Badge 
                  variant="default" 
                  className="bg-blue-600 text-white text-xs px-2 py-0 h-5 min-w-[20px] flex items-center justify-center"
                >
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}