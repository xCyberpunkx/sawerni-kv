"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Check, X, DollarSign, ImageIcon, Paperclip } from "lucide-react"
import type { ChatConversation } from "@/lib/chat-data"

interface ChatInterfaceProps {
  conversation: ChatConversation
  currentUserId: string
  currentUserRole: "client" | "photographer"
}

export function ChatInterface({ conversation, currentUserId, currentUserRole }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showPriceProposal, setShowPriceProposal] = useState(false)
  const [proposalAmount, setProposalAmount] = useState("")
  const [proposalDescription, setProposalDescription] = useState("")

  const otherUser =
    currentUserRole === "client"
      ? { name: conversation.photographerName, avatar: conversation.photographerAvatar }
      : { name: conversation.clientName, avatar: conversation.clientAvatar }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleSendProposal = () => {
    if (proposalAmount && proposalDescription) {
      // In a real app, this would send the proposal to the backend
      console.log("Sending proposal:", { amount: proposalAmount, description: proposalDescription })
      setShowPriceProposal(false)
      setProposalAmount("")
      setProposalDescription("")
    }
  }

  const handleProposalAction = (messageId: string, action: "accept" | "reject") => {
    // In a real app, this would update the proposal status
    console.log("Proposal action:", messageId, action)
  }

  const formatTime = (date: Date) => {
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
            <p className="text-sm text-muted-foreground">{conversation.projectType}</p>
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
        {conversation.messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                {!isCurrentUser && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={message.senderName} />
                      <AvatarFallback className="text-xs">
                        {message.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{message.senderName}</span>
                  </div>
                )}

                {message.type === "text" && (
                  <div
                    className={`p-3 rounded-lg ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}

                {message.type === "price_proposal" && message.priceProposal && (
                  <Card className="border-2 border-accent/20 card-hover animate-bounce-in">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-accent animate-pulse" />
                        <span className="font-semibold text-accent">Price Proposal</span>
                        <Badge
                          variant={
                            message.priceProposal.status === "accepted"
                              ? "default"
                              : message.priceProposal.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="ml-auto animate-fade-in-up"
                        >
                          {message.priceProposal.status}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-accent mb-2 animate-slide-in-left">
                        {formatCurrency(message.priceProposal.amount)} {message.priceProposal.currency}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{message.priceProposal.description}</p>

                      {message.priceProposal.status === "pending" && !isCurrentUser && (
                        <div className="flex gap-2 animate-fade-in-up animate-delay-200">
                          <Button
                            size="sm"
                            onClick={() => handleProposalAction(message.id, "accept")}
                            className="bg-primary hover:bg-primary/90 button-premium"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProposalAction(message.id, "reject")}
                            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">{formatTime(message.timestamp)}</p>
                    </CardContent>
                  </Card>
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
