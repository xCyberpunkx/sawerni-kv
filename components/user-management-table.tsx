"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Edit, Trash2, Ban, Eye } from "lucide-react"
import { Api } from "@/lib/api"

export function UserManagementTable() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await Api.get<any>("/admin/users?page=1&perPage=50")
      setUsers(res.items || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const clients = filteredUsers.filter((user) => user.role === "client")
  const photographers = filteredUsers.filter((user) => user.role === "photographer")
  const admins = filteredUsers.filter((user) => user.role === "admin")

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
  }

  const handleBanUser = (userId: string) => {
    // In a real app, this would update the user's status
    console.log("Banning user:", userId)
  }

  const UserRow = ({ user }: { user: User }) => (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar || "/placeholder.svg"} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{user.name}</h3>
          <Badge variant={user.role === "admin" ? "default" : user.role === "photographer" ? "secondary" : "outline"}>
            {user.role === "admin" ? "Admin" : user.role === "photographer" ? "Photographer" : "Client"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          {user.state && <span>{user.state}</span>}
          <span>Joined {new Date(user.joinedDate).toLocaleDateString("en-US")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">State</p>
                  <p className="text-muted-foreground">{user.state || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium">Joined</p>
                  <p className="text-muted-foreground">{new Date(user.joinedDate).toLocaleDateString("en-US")}</p>
                </div>
                {user.serviceType && (
                  <div className="col-span-2">
                    <p className="font-medium">Service type</p>
                    <p className="text-muted-foreground">{user.serviceType}</p>
                  </div>
                )}
                {user.bio && (
                  <div className="col-span-2">
                    <p className="font-medium">Bio</p>
                    <p className="text-muted-foreground">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={() => handleBanUser(user.id)}>
          <Ban className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
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
          {filteredUsers.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {clients.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="photographers" className="space-y-4">
          {photographers.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          {admins.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
