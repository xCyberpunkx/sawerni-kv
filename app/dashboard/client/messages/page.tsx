"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChatList } from "@/components/chat-list"
import { ChatInterface } from "@/components/chat-interface"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { Search, MessageCircle } from "lucide-react"

export default function ClientMessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>()
  const [searchQuery, setSearchQuery] = useState("")

  const [conversations, setConversations] = useState<any[]>([])
  const [currentUserRole] = useState("client" as const)
  const currentUserId = mockAuth.getCurrentUser()?.id || ""

  useEffect(() => {
    const run = async () => {
      const data = await Api.get<{ items: any[] }>("/conversations?page=1&perPage=50")
      setConversations(data.items || [])
    }
    run()
  }, [])

  // Filter by search query
  const filteredConversations = conversations.filter(
    (chat) =>
      (chat.otherUser?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage?.content || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConversation = conversations.find((c) => c.id === selectedChatId) || null

  // Load messages for selected conversation
  useEffect(() => {
    const run = async () => {
      if (!selectedChatId) return
      try {
        const res = await Api.get<{ items: any[] }>(`/conversations/${selectedChatId}/messages?page=1&perPage=50`)
        setConversations((prev) => prev.map((c) => (c.id === selectedChatId ? { ...c, messages: res.items || [] } : c)))
      } catch {}
    }
    run()
  }, [selectedChatId])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with photographers and negotiate prices for your projects</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <ChatList
                  conversations={filteredConversations}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  currentUserRole={currentUserRole}
                />
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {selectedConversation ? (
              <ChatInterface
                conversation={selectedConversation}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start chatting with photographers
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
