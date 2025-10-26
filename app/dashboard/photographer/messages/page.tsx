"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChatList } from "@/components/chat-list"
import { ChatInterface } from "@/components/chat-interface"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"
import { Search, MessageCircle, Users, Filter, Plus, RefreshCw, Phone, Video, MoreVertical } from "lucide-react"
import { connectSocket, disconnectSocket } from "@/lib/socket"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// ✅ Aligned with backend response structure
interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar?: string
    online?: boolean
  }
  lastActiveAt: string // ✅ Backend returns lastActiveAt, not updatedAt
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

// ✅ Backend response structure for conversations list
interface ConversationsResponse {
  items: Conversation[]
  meta: {
    total: number
    page: number
    perPage: number
    pages: number
  }
}

// ✅ Backend response structure for messages
interface MessagesResponse {
  conversation: {
    id: string
    participantAId: string
    participantBId: string
    lastActiveAt: string
    participantA: { id: string; name: string }
    participantB: { id: string; name: string }
  }
  messages: {
    items: any[]
    meta: {
      total: number
      page: number
      perPage: number
      pages: number
    }
  }
}

type FilterType = "all" | "unread"
type SortType = "recent" | "unread" | "name"

export default function PhotographerMessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentUserRole] = useState("photographer" as const)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState("")
  const [threadError, setThreadError] = useState("")
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  const [filter, setFilter] = useState<FilterType>("all")
  const [sort, setSort] = useState<SortType>("recent")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [messageCache, setMessageCache] = useState<Map<string, { messages: any[], lastFetched: number }>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize current user
  useEffect(() => {
    setCurrentUser(mockAuth.getCurrentUser())
  }, [])

  // Utility function to deduplicate messages
  const deduplicateMessages = useCallback((messages: any[]) => {
    const seen = new Set()
    return messages.filter(message => {
      if (seen.has(message.id)) {
        return false
      }
      seen.add(message.id)
      return true
    })
  }, [])

  // Check if messages are cached and still fresh (5 minutes)
  const getCachedMessages = useCallback((conversationId: string) => {
    const cached = messageCache.get(conversationId)
    if (cached && Date.now() - cached.lastFetched < 5 * 60 * 1000) {
      return cached.messages
    }
    return null
  }, [messageCache])

  // Cache messages
  const cacheMessages = useCallback((conversationId: string, messages: any[]) => {
    setMessageCache(prev => new Map(prev).set(conversationId, {
      messages,
      lastFetched: Date.now()
    }))
  }, [])

  // ✅ Load conversations - aligned with backend GET /conversations
  const loadConversations = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true)
    } else {
      setListLoading(true)
    }
    setListError("")
    try {
      // ✅ Backend returns { items, meta }
      const data = await Api.get<ConversationsResponse>("/conversations?page=1&perPage=100")
      const conversationsWithUsers = data.items?.map(conv => ({
        ...conv,
        otherUser: {
          ...conv.otherUser,
          online: onlineUsers.has(conv.otherUser.id)
        }
      })) || []
      setConversations(conversationsWithUsers)
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to load conversations"
      setListError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setListLoading(false)
      setIsRefreshing(false)
    }
  }, [onlineUsers])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Socket connection for real-time updates
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sawerni_access_token") : null
    if (!token) return

    const socket = connectSocket(token, {
      onMessage: (message) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.conversationId
              ? { 
                  ...c, 
                  messages: [...(c.messages || []), message], 
                  lastMessage: message,
                  unreadCount: c.id === selectedChatId ? 0 : (c.unreadCount || 0) + 1,
                  lastActiveAt: new Date().toISOString() // ✅ Updated to lastActiveAt
                }
              : c,
          ),
        )
        
        // If this is the current conversation, scroll to bottom
        if (message.conversationId === selectedChatId) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }
      },
      onUserOnline: (userId: string) => {
        setOnlineUsers(prev => new Set(prev).add(userId))
        setConversations(prev => 
          prev.map(conv => 
            conv.otherUser.id === userId 
              ? { ...conv, otherUser: { ...conv.otherUser, online: true } }
              : conv
          )
        )
      },
      onUserOffline: (userId: string) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        setConversations(prev => 
          prev.map(conv => 
            conv.otherUser.id === userId 
              ? { ...conv, otherUser: { ...conv.otherUser, online: false } }
              : conv
          )
        )
      },
      onConversationCreated: (newConversation: Conversation) => {
        setConversations(prev => [newConversation, ...prev])
      }
    })

    return () => {
      disconnectSocket()
    }
  }, [selectedChatId])

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((chat) => {
      const matchesSearch = 
        (chat.otherUser?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.lastMessage?.content || "").toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = 
        filter === "all" || 
        (filter === "unread" && chat.unreadCount > 0)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sort) {
        case "recent":
          // ✅ Use lastActiveAt instead of updatedAt
          return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
        case "unread":
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount
          }
          return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
        case "name":
          return a.otherUser.name.localeCompare(b.otherUser.name)
        default:
          return 0
      }
    })

  const selectedConversation = conversations.find((c) => c.id === selectedChatId) || null

  // ✅ Load messages - aligned with backend GET /conversations/:id/messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId) return
      
      // Check cache first
      const cachedMessages = getCachedMessages(selectedChatId)
      if (cachedMessages) {
        setConversations((prev) => 
          prev.map((c) => 
            c.id === selectedChatId 
              ? { ...c, messages: cachedMessages, unreadCount: 0 } 
              : c
          )
        )
        setHasMoreMessages(true)
        setCurrentPage(1)
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        return
      }
      
      setMessagesLoading(true)
      setThreadError("")
      setCurrentPage(1)
      setHasMoreMessages(true)
      try {
        // ✅ Backend returns { conversation, messages: { items, meta } }
        const res = await Api.get<MessagesResponse>(`/conversations/${selectedChatId}/messages?page=1&perPage=50`)
        const messages = deduplicateMessages(res.messages.items || [])
        const totalPages = res.messages.meta?.pages || 1
        
        // Cache the messages
        cacheMessages(selectedChatId, messages)
        
        setConversations((prev) => 
          prev.map((c) => 
            c.id === selectedChatId 
              ? { ...c, messages, unreadCount: 0 } 
              : c
          )
        )
        
        setHasMoreMessages(totalPages > 1)
        
        // ✅ Mark conversation as read using PATCH /conversations/:id/read
        await Api.patch(`/conversations/${selectedChatId}/read`)
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } catch (e: any) {
        const errorMessage = e?.message || "Failed to load messages"
        setThreadError(errorMessage)
        setRetryCount(prev => prev + 1)
        
        if (e?.status === 401) {
          toast.error("Session expired. Please refresh the page.")
        } else if (e?.status === 403) {
          toast.error("You don't have permission to view this conversation.")
        } else if (e?.status === 404) {
          toast.error("Conversation not found.")
        } else if (e?.status >= 500) {
          toast.error("Server error. Please try again later.")
        } else {
          toast.error(errorMessage)
        }
      } finally {
        setMessagesLoading(false)
      }
    }
    
    loadMessages()
  }, [selectedChatId, getCachedMessages, deduplicateMessages, cacheMessages])

  // ✅ Load more messages with pagination
  const loadMoreMessages = useCallback(async () => {
    if (!selectedChatId || loadingMoreMessages || !hasMoreMessages) return
    
    setLoadingMoreMessages(true)
    try {
      const nextPage = currentPage + 1
      const res = await Api.get<MessagesResponse>(`/conversations/${selectedChatId}/messages?page=${nextPage}&perPage=50`)
      const newMessages = res.messages.items || []
      const totalPages = res.messages.meta?.pages || 1
      
      if (newMessages.length > 0) {
        const currentMessages = conversations.find(c => c.id === selectedChatId)?.messages || []
        const allMessages = deduplicateMessages([...newMessages, ...currentMessages])
        
        setConversations((prev) => 
          prev.map((c) => 
            c.id === selectedChatId 
              ? { ...c, messages: allMessages } 
              : c
          )
        )
        
        cacheMessages(selectedChatId, allMessages)
        
        setCurrentPage(nextPage)
        setHasMoreMessages(nextPage < totalPages)
      } else {
        setHasMoreMessages(false)
      }
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to load more messages"
      toast.error(errorMessage)
    } finally {
      setLoadingMoreMessages(false)
    }
  }, [selectedChatId, currentPage, loadingMoreMessages, hasMoreMessages, conversations, deduplicateMessages, cacheMessages])

  // Retry loading messages
  const retryLoadMessages = useCallback(async () => {
    if (!selectedChatId) return
    setThreadError("")
    setRetryCount(0)
    
    setMessagesLoading(true)
    try {
      const res = await Api.get<MessagesResponse>(`/conversations/${selectedChatId}/messages?page=1&perPage=50`)
      const messages = deduplicateMessages(res.messages.items || [])
      const totalPages = res.messages.meta?.pages || 1
      
      cacheMessages(selectedChatId, messages)
      
      setConversations((prev) => 
        prev.map((c) => 
          c.id === selectedChatId 
            ? { ...c, messages, unreadCount: 0 } 
            : c
        )
      )
      
      setHasMoreMessages(totalPages > 1)
      setCurrentPage(1)
      await Api.patch(`/conversations/${selectedChatId}/read`)
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      
      toast.success("Messages loaded successfully")
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to load messages"
      setThreadError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setMessagesLoading(false)
    }
  }, [selectedChatId, deduplicateMessages, cacheMessages])

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  // ✅ Removed - backend doesn't have archive endpoint
  // ✅ handleArchiveConversation removed

  if (!currentUser) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please sign in to view your messages.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              Messages
              {totalUnreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                  {totalUnreadCount} unread
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Chat with clients and collaborators</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadConversations(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List Sidebar */}
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conversations
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-semibold">Filter</div>
                    {(["all", "unread"] as FilterType[]).map((f) => (
                      <DropdownMenuItem
                        key={f}
                        onClick={() => setFilter(f)}
                        className={filter === f ? "bg-accent" : ""}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    
                    <div className="px-2 py-1.5 text-sm font-semibold">Sort by</div>
                    {(["recent", "unread", "name"] as SortType[]).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => setSort(s)}
                        className={sort === s ? "bg-accent" : ""}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations or messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{conversations.length} conversations</span>
                {totalUnreadCount > 0 && (
                  <span className="text-blue-600 font-medium">{totalUnreadCount} unread</span>
                )}
                <span>{onlineUsers.size} online</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 overflow-hidden">
              {listLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listError ? (
                <div className="p-6 text-center">
                  <div className="text-sm text-red-600 mb-4">{listError}</div>
                  <Button onClick={() => loadConversations()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="h-full overflow-y-auto">
                  <ChatList
                    conversations={filteredConversations}
                    selectedChatId={selectedChatId}
                    onSelectChat={setSelectedChatId}
                    currentUserRole={currentUserRole}
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No conversations found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "You don't have any conversations yet"}
                  </p>
                  {(searchQuery || filter !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("")
                        setFilter("all")
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.otherUser.avatar} />
                        <AvatarFallback>
                          {selectedConversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{selectedConversation.otherUser.name}</h3>
                          {selectedConversation.otherUser.online && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* ✅ Removed Phone/Video/Archive options - not in backend */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading messages...</p>
                      </div>
                    </div>
                  ) : threadError ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-sm text-red-600 mb-4">{threadError}</div>
                        <div className="space-y-2">
                          <Button 
                            onClick={retryLoadMessages} 
                            variant="outline"
                            disabled={messagesLoading}
                          >
                            {messagesLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Retrying...
                              </>
                            ) : (
                              "Retry Loading Messages"
                            )}
                          </Button>
                          {retryCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Retry attempt: {retryCount}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ChatInterface
                      conversation={selectedConversation}
                      currentUserId={currentUser.id}
                      currentUserRole={currentUserRole}
                      onLoadMoreMessages={loadMoreMessages}
                      hasMoreMessages={hasMoreMessages}
                      loadingMoreMessages={loadingMoreMessages}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </>
            ) : (
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a conversation from the list to start chatting
                  </p>
                  {threadError && (
                    <p className="text-sm text-red-600 mt-4">{threadError}</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}