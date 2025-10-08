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
import { connectSocket } from "@/lib/socket"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar?: string
    online?: boolean
    lastSeen?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
    type: string
    senderId: string
  }
  unreadCount: number
  project?: {
    id: string
    title: string
    status: string
  }
  createdAt: string
  updatedAt: string
  messages?: any[]
}

type FilterType = "all" | "unread" | "archived"
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
  const [filter, setFilter] = useState<FilterType>("all")
  const [sort, setSort] = useState<SortType>("recent")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize current user
  useEffect(() => {
    setCurrentUser(mockAuth.getCurrentUser())
  }, [])

  const loadConversations = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true)
    } else {
      setListLoading(true)
    }
    setListError("")
    try {
      const data = await Api.get<{ items: Conversation[]; meta?: any }>("/conversations?page=1&perPage=100")
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
                  updatedAt: new Date().toISOString()
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
      onUserOnline: (userId) => {
        setOnlineUsers(prev => new Set(prev).add(userId))
        setConversations(prev => 
          prev.map(conv => 
            conv.otherUser.id === userId 
              ? { ...conv, otherUser: { ...conv.otherUser, online: true } }
              : conv
          )
        )
      },
      onUserOffline: (userId) => {
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
      onConversationCreated: (newConversation) => {
        setConversations(prev => [newConversation, ...prev])
      }
    })

    return () => {
      // socket?.disconnect()
    }
  }, [selectedChatId])

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((chat) => {
      const matchesSearch = 
        (chat.otherUser?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.lastMessage?.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.project?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = 
        filter === "all" || 
        (filter === "unread" && chat.unreadCount > 0) ||
        (filter === "archived" && false) // Add archived logic if needed

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sort) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "unread":
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "name":
          return a.otherUser.name.localeCompare(b.otherUser.name)
        default:
          return 0
      }
    })

  const selectedConversation = conversations.find((c) => c.id === selectedChatId) || null

  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId) return
      
      setMessagesLoading(true)
      setThreadError("")
      try {
        const res = await Api.get<{ items: any[] }>(`/conversations/${selectedChatId}/messages?page=1&perPage=100`)
        setConversations((prev) => 
          prev.map((c) => 
            c.id === selectedChatId 
              ? { ...c, messages: res.items || [], unreadCount: 0 } 
              : c
          )
        )
        await Api.patch(`/conversations/${selectedChatId}/read`)
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } catch (e: any) {
        const errorMessage = e?.message || "Failed to load messages"
        setThreadError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setMessagesLoading(false)
      }
    }
    
    loadMessages()
  }, [selectedChatId])

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  const handleStartNewChat = async () => {
    // Implementation for starting new chat
    toast.info("New chat feature coming soon")
  }

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await Api.patch(`/conversations/${conversationId}/archive`)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (selectedChatId === conversationId) {
        setSelectedChatId(undefined)
      }
      toast.success("Conversation archived")
    } catch (e: any) {
      toast.error(e?.message || "Failed to archive conversation")
    }
  }

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
            <p className="text-muted-foreground">Chat with clients and send price proposals for their projects</p>
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
            <Button onClick={handleStartNewChat} className="gap-2">
              <Plus className="h-4 w-4" />
              New Chat
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
                  placeholder="Search conversations, messages, or projects..."
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
                    onArchiveConversation={handleArchiveConversation}
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No conversations found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Start a conversation with your clients to get started"}
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
                        {selectedConversation.project && (
                          <p className="text-sm text-muted-foreground">
                            Project: {selectedConversation.project.title}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Project</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleArchiveConversation(selectedConversation.id)}
                            className="text-red-600"
                          >
                            Archive Conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="outline"
                        >
                          Reload Messages
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ChatInterface
                      conversation={selectedConversation}
                      currentUserId={currentUser.id}
                      currentUserRole={currentUserRole}
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
                    Choose a conversation from the list to start chatting with clients about their projects
                  </p>
                  <Button onClick={handleStartNewChat} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Start New Conversation
                  </Button>
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