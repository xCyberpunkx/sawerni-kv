"use client"

import { useEffect, useMemo, useState } from "react"
import { useConversations, useMessages } from "@/lib/hooks"
import { ChatList } from "@/components/chat-list"
import { ChatInterface } from "@/components/chat-interface"
import { Card, CardContent } from "@/components/ui/card"
import { getAccessToken } from "@/lib/api"
import { connectSocket } from "@/lib/socket"

export default function MessagesPage() {
  const { data: convs, refetch } = useConversations(1, 50)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const { data: messagesData, refetch: refetchMessages } = useMessages(selectedId || "", 1, 50)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    connectSocket(token, {
      onMessage: () => {
        refetch()
        if (selectedId) refetchMessages()
      },
      onConversationCreated: () => refetch(),
    })
  }, [refetch, refetchMessages, selectedId])

  const conversations = useMemo(() => {
    return (convs?.items || []).map((c) => ({
      id: c.id,
      otherUser: c.otherUser,
      lastMessage: c.lastMessage ? { content: c.lastMessage.content, createdAt: c.lastMessage.createdAt } : undefined,
      unreadCount: c.unreadCount,
      lastActiveAt: c.lastActiveAt,
    }))
  }, [convs])

  const selectedConv = useMemo(() => (conversations || []).find((c) => c.id === selectedId), [conversations, selectedId])

  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <ChatList
            conversations={conversations}
            selectedChatId={selectedId}
            onSelectChat={(id) => setSelectedId(id)}
            currentUserRole="client"
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-0 h-[70vh]">
          {selectedConv ? (
            <ChatInterface
              conversation={{
                id: selectedConv.id,
                otherUser: selectedConv.otherUser,
                messages: (((messagesData as any)?.items) || []) as any,
              }}
              currentUserId={"me"}
              currentUserRole="client"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Select a conversation</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
