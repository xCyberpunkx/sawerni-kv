// components/chat-interface.tsx
"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Paperclip, Send, Image, File, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { Api } from "@/lib/api"
import { toast } from "sonner"

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

interface ChatInterfaceProps {
  conversation: Conversation
  currentUserId: string
  currentUserRole: string
  onLoadMoreMessages: () => void
  hasMoreMessages: boolean
  loadingMoreMessages: boolean
  onMessageSent?: (newMessage: any) => void // Updated to pass the new message
}

export function ChatInterface({
  conversation,
  currentUserId,
  currentUserRole,
  onLoadMoreMessages,
  hasMoreMessages,
  loadingMoreMessages,
  onMessageSent
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Combine actual messages with optimistic messages, removing duplicates and sorting
  const displayMessages = useMemo(() => {
    const actualMessages = conversation.messages || []
    const combined = [...actualMessages, ...optimisticMessages]
    
    // Remove duplicates based on message id
    const seen = new Set()
    const uniqueMessages = combined.filter(message => {
      if (seen.has(message.id)) {
        return false
      }
      seen.add(message.id)
      return true
    })
    
    // Sort by creation time
    return uniqueMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [conversation.messages, optimisticMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayMessages])

  // Auto-scroll handling for loading more messages
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
        onLoadMoreMessages()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMoreMessages, loadingMoreMessages, onLoadMoreMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() && attachments.length === 0) {
      toast.error("Message must have content or attachments")
      return
    }

    setSending(true)
    
    // Create optimistic message with proper structure
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      sender: {
        id: currentUserId,
        name: "You"
      },
      conversationId: conversation.id, // Add conversationId
      attachments: attachments.map(file => ({
        id: `temp-attachment-${Date.now()}-${file.name}`,
        originalName: file.name,
        mimetype: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      })),
      isOptimistic: true
    }

    // Add to optimistic messages immediately
    setOptimisticMessages(prev => [...prev, tempMessage])
    
    // Clear input fields immediately
    const messageToSend = newMessage.trim()
    const filesToSend = [...attachments]
    setNewMessage("")
    setAttachments([])
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    try {
      const formData = new FormData()
      
      // Add content if available
      if (messageToSend) {
        formData.append("content", messageToSend)
      }
      
      // Add attachments if any
      filesToSend.forEach(file => {
        formData.append("attachments", file)
      })

      // Send message to backend
      const sentMessage = await Api.post(`/conversations/${conversation.id}/messages`, formData, {
        multipart: true
      })

      // Remove optimistic message
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      
      // Notify parent about the new message with the actual server response
      if (onMessageSent) {
        onMessageSent({
          ...sentMessage,
          conversationId: conversation.id // Ensure conversationId is included
        })
      }
      
      toast.success("Message sent successfully")
      
    } catch (error: any) {
      console.error("Failed to send message:", error)
      
      // Remove the failed optimistic message
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      
      // Restore the message and attachments for retry
      setNewMessage(messageToSend)
      setAttachments(filesToSend)
      
      if (error?.status === 401) {
        toast.error("Authentication failed. Please refresh the page and try again.")
      } else if (error?.status === 403) {
        toast.error("You don't have permission to send messages in this conversation")
      } else if (error?.status === 404) {
        toast.error("Conversation not found")
      } else if (error?.status === 400) {
        toast.error(error.message || "Invalid message data")
      } else {
        toast.error(error.message || "Failed to send message")
      }
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 5) {
      toast.error("Maximum 5 files allowed")
      return
    }
    
    // Check total size (max 10MB)
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    if (totalSize > 10 * 1024 * 1024) {
      toast.error("Total file size must be less than 10MB")
      return
    }
    
    setAttachments(prev => [...prev, ...files.slice(0, 5 - prev.length)])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatMessageTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm')
    } catch {
      return "Unknown"
    }
  }

  const getAttachmentIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const getAttachmentPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  const isCurrentUser = (senderId: string) => senderId === currentUserId

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Load More Messages Indicator */}
        {hasMoreMessages && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMoreMessages}
              disabled={loadingMoreMessages}
              className="text-xs"
            >
              {loadingMoreMessages ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load earlier messages"
              )}
            </Button>
          </div>
        )}

        {/* Messages */}
        {displayMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${isCurrentUser(message.senderId) ? 'flex-row-reverse' : 'flex-row'} ${message.isOptimistic ? 'opacity-70' : ''}`}
            >
              {/* Avatar - only show for other user */}
              {!isCurrentUser(message.senderId) && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={conversation.otherUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {conversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message Content */}
              <div className={`max-w-[70%] ${isCurrentUser(message.senderId) ? 'text-right' : 'text-left'}`}>
                {/* Sender name - only for other user */}
                {!isCurrentUser(message.senderId) && (
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {message.sender?.name || conversation.otherUser.name}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isCurrentUser(message.senderId)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {/* Text Content */}
                  {message.content && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {message.attachments.map((attachment: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                          {attachment.mimetype?.startsWith('image/') ? (
                            <img
                              src={attachment.url}
                              alt={attachment.originalName}
                              className="max-w-full max-h-32 rounded object-cover"
                            />
                          ) : (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm hover:underline"
                            >
                              <File className="h-4 w-4" />
                              {attachment.originalName}
                              <span className="text-xs text-muted-foreground">
                                ({(attachment.size / 1024).toFixed(1)} KB)
                              </span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMessageTime(message.createdAt)}
                  {message.isOptimistic && " • Sending..."}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <Card className="mx-4 mb-2">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => {
                const previewUrl = getAttachmentPreview(file)
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm max-w-[200px]"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="h-8 w-8 object-cover rounded"
                      />
                    ) : (
                      getAttachmentIcon(file)
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Input */}
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= 5 || sending}
            title="Add attachments (max 5 files, 10MB total)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />

          <Button 
            type="submit" 
            size="icon"
            disabled={(!newMessage.trim() && attachments.length === 0) || sending}
          >
            {sending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </div>
  )
}