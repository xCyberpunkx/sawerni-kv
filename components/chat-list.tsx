"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Archive, Trash2, Pin, User, FileText } from "lucide-react"

interface ConversationItem {
  id: string
  otherUser?: { 
    id: string; 
    name: string; 
    avatarUrl?: string;
    online?: boolean;
    lastSeen?: string;
  }
  lastMessage?: { 
    content?: string; 
    createdAt?: string;
    type?: string;
    senderId?: string;
  }
  unreadCount?: number
  lastActiveAt?: string
  project?: {
    id: string;
    title: string;
    status: string;
  }
  isPinned?: boolean
  isArchived?: boolean
  typing?: boolean
}

interface ChatListProps {
  conversations: ConversationItem[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  currentUserRole: "client" | "photographer"
  onArchiveConversation?: (conversationId: string) => void
  onDeleteConversation?: (conversationId: string) => void
  onPinConversation?: (conversationId: string) => void
}

export function ChatList({ 
  conversations, 
  selectedChatId, 
  onSelectChat, 
  currentUserRole,
  onArchiveConversation,
  onDeleteConversation,
  onPinConversation
}: ChatListProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)

  const formatTime = (dateInput: Date | string | undefined) => {
    if (!dateInput) return ""
    try {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
      if (isNaN(date.getTime())) return ""
      
      const now = new Date()
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString("en-US", {
          weekday: "short",
        })
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }
    } catch {
      return ""
    }
  }

  const getMessagePreview = (message: ConversationItem['lastMessage']) => {
    if (!message) return "No messages yet"
    
    if (message.type === "image") {
      return "📷 Photo"
    } else if (message.type === "file") {
      return "📎 File"
    } else if (message.type === "proposal") {
      return "💼 Price proposal"
    } else if (message.type === "system") {
      return "⚙️ System message"
    }
    
    return message.content || ""
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Separate pinned and regular conversations
  const pinnedConversations = conversations.filter(conv => conv.isPinned)
  const regularConversations = conversations.filter(conv => !conv.isPinned)

  return (
    <div className="space-y-1">
      {/* Pinned Conversations */}
      {pinnedConversations.length > 0 && (
        <div className="mb-4">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Pin className="h-3 w-3" />
            Pinned
          </div>
          <div className="space-y-1">
            {pinnedConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedChatId === conversation.id}
                isHovered={hoveredChat === conversation.id}
                onSelect={() => onSelectChat(conversation.id)}
                onMouseEnter={() => setHoveredChat(conversation.id)}
                onMouseLeave={() => setHoveredChat(null)}
                onArchive={onArchiveConversation}
                onDelete={onDeleteConversation}
                onPin={onPinConversation}
                formatTime={formatTime}
                getMessagePreview={getMessagePreview}
                getInitials={getInitials}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Conversations */}
      <div className="space-y-1">
        {regularConversations.length > 0 && pinnedConversations.length > 0 && (
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            All Conversations
          </div>
        )}
        {regularConversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedChatId === conversation.id}
            isHovered={hoveredChat === conversation.id}
            onSelect={() => onSelectChat(conversation.id)}
            onMouseEnter={() => setHoveredChat(conversation.id)}
            onMouseLeave={() => setHoveredChat(null)}
            onArchive={onArchiveConversation}
            onDelete={onDeleteConversation}
            onPin={onPinConversation}
            formatTime={formatTime}
            getMessagePreview={getMessagePreview}
            getInitials={getInitials}
          />
        ))}
      </div>

      {/* Empty State */}
      {conversations.length === 0 && (
        <div className="text-center py-8 px-4">
          <div className="bg-muted/50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No conversations</h3>
          <p className="text-muted-foreground text-sm">
            Start a conversation with {currentUserRole === 'photographer' ? 'clients' : 'photographers'} to get started
          </p>
        </div>
      )}
    </div>
  )
}

// Separate component for individual conversation card
function ConversationCard({
  conversation,
  isSelected,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onArchive,
  onDelete,
  onPin,
  formatTime,
  getMessagePreview,
  getInitials
}: {
  conversation: ConversationItem
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
  onPin?: (id: string) => void
  formatTime: (date: Date | string | undefined) => string
  getMessagePreview: (message: ConversationItem['lastMessage']) => string
  getInitials: (name: string) => string
}) {
  const otherUser = conversation.otherUser || { name: "Unknown User", avatarUrl: undefined, online: false }
  const hasUnread = (conversation.unreadCount || 0) > 0
  const isTyping = conversation.typing

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 group ${
        isSelected 
          ? "ring-2 ring-primary bg-primary/5 border-primary/20" 
          : "hover:bg-muted/50 border-transparent"
      } ${conversation.isPinned ? 'border-l-4 border-l-yellow-400' : ''}`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar with Online Status */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            {otherUser.online && (
              <div className="absolute -bottom-1 -right-1">
                <div className="bg-green-500 border-2 border-background rounded-full w-3 h-3" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className={`font-semibold text-sm truncate ${hasUnread ? 'text-foreground' : 'text-foreground/90'}`}>
                  {otherUser.name}
                </h4>
                {conversation.project && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                    <FileText className="h-3 w-3 mr-1" />
                    Project
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(conversation.lastMessage?.createdAt || conversation.lastActiveAt)}
                </span>
                
                {(isHovered || isSelected) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onPin && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onPin(conversation.id)
                          }}
                        >
                          <Pin className="h-4 w-4 mr-2" />
                          {conversation.isPinned ? 'Unpin' : 'Pin'} conversation
                        </DropdownMenuItem>
                      )}
                      
                      {conversation.project && (
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <FileText className="h-4 w-4 mr-2" />
                          View project
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <User className="h-4 w-4 mr-2" />
                        View profile
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {onArchive && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onArchive(conversation.id)
                          }}
                          className="text-amber-600"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(conversation.id)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Message Preview */}
            <div className="mb-2">
              {isTyping ? (
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-primary font-medium">typing...</span>
                </div>
              ) : (
                <p className={`text-sm truncate ${
                  hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {getMessagePreview(conversation.lastMessage)}
                </p>
              )}
            </div>

            {/* Footer with status badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {conversation.project && (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {conversation.project.title}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    hasUnread 
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {hasUnread ? 'Unread' : 'Read'}
                </Badge>
                
                {hasUnread && (
                  <Badge 
                    className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}