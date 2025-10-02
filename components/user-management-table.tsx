"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Edit, Trash2, Ban, Eye, Loader2 } from "lucide-react"
import { Api } from "@/lib/api"
import { toast } from "sonner"

// Define the User type based on backend response
interface User {
  id: string
  email: string
  name: string
  role: "CLIENT" | "PHOTOGRAPHER" | "ADMIN"
  emailVerified: boolean
  disabled: boolean
  createdAt: string
  // Optional fields that might come from backend
  avatar?: string
  state?: string
  photographer?: {
    bio?: string
    services?: any[]
  }
}

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "" as "CLIENT" | "PHOTOGRAPHER" | "ADMIN"
  })

  const loadUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<{ items: User[] }>("/admin/users?page=1&perPage=50")
      setUsers(res.items || [])
    } catch (e: any) {
      console.error("Failed to load users:", e)
      setError(e?.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role.toLowerCase() === filterRole
    return matchesSearch && matchesRole
  })

  const clients = filteredUsers.filter((user) => user.role === "CLIENT")
  const photographers = filteredUsers.filter((user) => user.role === "PHOTOGRAPHER")
  const admins = filteredUsers.filter((user) => user.role === "ADMIN")

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    
    if (!confirm(`Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove all their data including bookings, reviews, and messages.`)) {
      return
    }
    
    try {
      await Api.delete(`/admin/users/${userId}`)
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      toast.success("User deleted successfully")
    } catch (e: any) {
      console.error("Failed to delete user:", e)
      toast.error(e?.message || "Failed to delete user")
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return
      
      await Api.patch(`/admin/users/${userId}/status`, {
        disabled: !user.disabled
      })
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, disabled: !u.disabled } : u
      ))
      
      toast.success(`User ${user.disabled ? 'unbanned' : 'banned'} successfully`)
    } catch (e: any) {
      console.error("Failed to update user status:", e)
      toast.error(e?.message || "Failed to update user status")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role
    })
    setEditDialogOpen(true)
  }

  const handleSaveUserEdit = async () => {
    if (!editingUser) return
    
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      toast.error("Name and email are required")
      return
    }

    setSubmitting(true)
    try {
      await Api.put(`/admin/users/${editingUser.id}`, editFormData)
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, ...editFormData } : u
      ))
      
      setEditDialogOpen(false)
      setEditingUser(null)
      toast.success("User updated successfully")
    } catch (e: any) {
      console.error("Failed to update user:", e)
      toast.error(e?.message || "Failed to update user")
    } finally {
      setSubmitting(false)
    }
  }

  const UserRow = ({ user }: { user: User }) => (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{user.name}</h3>
          <Badge 
            variant={
              user.role === "ADMIN" ? "default" : 
              user.role === "PHOTOGRAPHER" ? "secondary" : "outline"
            }
            className={user.disabled ? "opacity-50" : ""}
          >
            {user.role === "ADMIN" ? "Admin" : 
             user.role === "PHOTOGRAPHER" ? "Photographer" : "Client"}
            {user.disabled && " (Banned)"}
          </Badge>
          {!user.emailVerified && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Unverified
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          {user.state && <span>{user.state}</span>}
          <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">
                      {user.role === "ADMIN" ? "Admin" : 
                       user.role === "PHOTOGRAPHER" ? "Photographer" : "Client"}
                    </Badge>
                    {user.disabled && (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                    {!user.emailVerified && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">User ID</p>
                  <p className="text-muted-foreground text-xs font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="font-medium">Joined</p>
                  <p className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-US")}</p>
                </div>
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-muted-foreground">{user.emailVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground">{user.disabled ? "Banned" : "Active"}</p>
                </div>
                {user.state && (
                  <div className="col-span-2">
                    <p className="font-medium">State</p>
                    <p className="text-muted-foreground">{user.state}</p>
                  </div>
                )}
                {user.photographer?.bio && (
                  <div className="col-span-2">
                    <p className="font-medium">Bio</p>
                    <p className="text-muted-foreground">{user.photographer.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleEditUser(user)}
          title="Edit User"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleBanUser(user.id)}
          title={user.disabled ? "Unban User" : "Ban User"}
        >
          <Ban className={`h-4 w-4 ${user.disabled ? "text-green-600" : "text-red-600"}`} />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDeleteUser(user.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadUsers}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="photographer">Photographers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total users</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{clients.length}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{photographers.length}</div>
              <div className="text-sm text-muted-foreground">Photographers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{admins.length}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="photographers">Photographers ({photographers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserRow key={user.id} user={user} />
            ))
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No clients found
            </div>
          ) : (
            clients.map((user) => (
              <UserRow key={user.id} user={user} />
            ))
          )}
        </TabsContent>

        <TabsContent value="photographers" className="space-y-4">
          {photographers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No photographers found
            </div>
          ) : (
            photographers.map((user) => (
              <UserRow key={user.id} user={user} />
            ))
          )}
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          {admins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No admins found
            </div>
          ) : (
            admins.map((user) => (
              <UserRow key={user.id} user={user} />
            ))
          )}
        </TabsContent>
      </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Name *</label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="User's full name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm font-medium">Email *</label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-role" className="text-sm font-medium">Role *</label>
              <Select 
                value={editFormData.role} 
                onValueChange={(value: "CLIENT" | "PHOTOGRAPHER" | "ADMIN") => 
                  setEditFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="PHOTOGRAPHER">Photographer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveUserEdit} 
                className="flex-1" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)} 
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}