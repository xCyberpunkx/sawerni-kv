"use client"

import { useEffect, useMemo, useState } from "react"
import { useConversations, useMessages } from "@/lib/hooks"
import { ChatList } from "@/components/chat-list"
import { ChatInterface } from "@/components/chat-interface"
import { Card, CardContent } from "@/components/ui/card"
import { getAccessToken } from "@/lib/api"
import { connectSocket } from "@/lib/socket"
import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesPage() {
  const { data: convs, refetch, isLoading, error } = useConversations(1, 50)
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
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChatList
              conversations={conversations}
              selectedChatId={selectedId}
              onSelectChat={(id) => setSelectedId(id)}
              currentUserRole="client"
            />
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-0 h-[70vh]">
          {isLoading ? (
            <div className="h-full p-4 space-y-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className="h-6 w-40 rounded-md" />
                </div>
              ))}
            </div>
          ) : selectedConv ? (
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
