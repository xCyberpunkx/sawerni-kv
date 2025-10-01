import { demoCredentials, demoUsers, type User } from "./demo-data"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class MockAuth {
  private currentUser: User | null = null
  private listeners: ((user: User | null) => void)[] = []

  constructor() {
    // Check for stored user on initialization
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sawerni_user")
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    const validCredential = Object.values(demoCredentials).find(
      (cred) => cred.email === email && cred.password === password,
    )

    if (!validCredential) {
      return { success: false, error: "Invalid email or password" }
    }

    // Find user
    const user = demoUsers.find((u) => u.email === email)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    this.currentUser = user
    if (typeof window !== "undefined") {
      localStorage.setItem("sawerni_user", JSON.stringify(user))
    }

    this.notifyListeners()
    return { success: true, user }
  }

  async signup(userData: {
    name: string
    email: string
    password: string
    role: "client" | "photographer"
    state?: string
    serviceType?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Check if email already exists
    if (demoUsers.some((u) => u.email === userData.email)) {
      return { success: false, error: "Email is already in use" }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      state: userData.state,
      serviceType: userData.serviceType,
      joinedDate: new Date().toISOString().split("T")[0],
    }

    // In a real app, this would be saved to the backend
    demoUsers.push(newUser)

    this.currentUser = newUser
    if (typeof window !== "undefined") {
      localStorage.setItem("sawerni_user", JSON.stringify(newUser))
    }

    this.notifyListeners()
    return { success: true, user: newUser }
  }

  logout() {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("sawerni_user")
    }
    this.notifyListeners()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  onAuthChange(callback: (user: User | null) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentUser))
  }
}

export const mockAuth = new MockAuth()
