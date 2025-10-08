"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Api } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Check, X, DollarSign, ImageIcon, Paperclip, RefreshCw } from "lucide-react"
interface ConversationMessage {
  id: string
  senderId: string
  content?: string
  createdAt: string
}
interface ConversationModel {
  id: string
  otherUser?: { id: string; name: string; avatarUrl?: string }
  messages?: ConversationMessage[]
  lastMessage?: { content?: string; createdAt?: string }
}

interface ChatInterfaceProps {
  conversation: ConversationModel
  currentUserId: string
  currentUserRole: "client" | "photographer"
  onLoadMoreMessages?: () => void
  hasMoreMessages?: boolean
  loadingMoreMessages?: boolean
}

export function ChatInterface({ 
  conversation, 
  currentUserId, 
  currentUserRole, 
  onLoadMoreMessages, 
  hasMoreMessages, 
  loadingMoreMessages 
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showPriceProposal, setShowPriceProposal] = useState(false)
  const [proposalAmount, setProposalAmount] = useState("")
  const [proposalDescription, setProposalDescription] = useState("")

  const otherUser = conversation.otherUser || { name: "User", avatarUrl: undefined }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      const form = new FormData()
      form.append("content", newMessage)
      const created = await Api.post<any>(`/conversations/${conversation.id}/messages`, form, { "Content-Type": "multipart/form-data" } as any)
      const updated = { ...(conversation as any) }
      updated.messages = [...(conversation.messages || []), created]
      ;(conversation as any).messages = updated.messages
      setNewMessage("")
    } catch {}
  }

  const handleSendProposal = async () => {
    if (!proposalAmount || !proposalDescription) return
    try {
      const form = new FormData()
      form.append("content", `${proposalDescription} — ${proposalAmount} DA`)
      const created = await Api.post<any>(`/conversations/${conversation.id}/messages`, form, { "Content-Type": "multipart/form-data" } as any)
      const updated = { ...(conversation as any) }
      updated.messages = [...(conversation.messages || []), created]
      ;(conversation as any).messages = updated.messages
    } catch {}
    setShowPriceProposal(false)
    setProposalAmount("")
    setProposalDescription("")
  }

  const handleProposalAction = (_messageId: string, _action: "accept" | "reject") => {}

  const formatTime = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-DZ", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-gradient-to-r from-card to-secondary/10 animate-slide-in-right">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 animate-glow">
            <AvatarImage
              src={otherUser.avatar || "/professional-algerian-woman-event-planner.png"}
              alt={otherUser.name}
            />
            <AvatarFallback>
              {otherUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">Conversation</p>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="bg-primary/10 text-primary animate-pulse">
              Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load More Messages Button */}
        {hasMoreMessages && onLoadMoreMessages && (
          <div className="flex justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMoreMessages}
              disabled={loadingMoreMessages}
              className="text-sm"
            >
              {loadingMoreMessages ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load older messages"
              )}
            </Button>
          </div>
        )}
        
        {(conversation.messages || []).map((message) => {
          const isCurrentUser = message.senderId === currentUserId

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                {!isCurrentUser && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={otherUser.avatarUrl || "/placeholder.svg"} alt={otherUser.name} />
                      <AvatarFallback className="text-xs">
                        {otherUser.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{message.senderName}</span>
                  </div>
                )}

                {message.content && (
                  <div
                    className={`p-3 rounded-lg ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Price Proposal Form */}
      {showPriceProposal && (
        <div className="border-t p-4 bg-secondary/30">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            Send Price Proposal
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Amount (DA)"
                value={proposalAmount}
                onChange={(e) => setProposalAmount(e.target.value)}
                type="number"
                className="w-32"
              />
              <Input
                placeholder="Package description..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendProposal} size="sm">
                Send Proposal
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPriceProposal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ImageIcon className="h-4 w-4" />
          </Button>
          {currentUserRole === "photographer" && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPriceProposal(!showPriceProposal)}
              className="text-accent hover:text-accent"
            >
              <DollarSign className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
