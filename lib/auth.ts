import { Api, setAccessToken, getAccessToken } from "./api"

export interface User {
  id: string
  email: string
  name?: string
  role: "CLIENT" | "PHOTOGRAPHER" | "ADMIN" | "client" | "photographer" | "admin"
  avatar?: string
}

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
    try {
      const res = await Api.post<{ user: any; accessToken: string }>("/auth/login", { email, password })

      // Persist access token first so that the subsequent /auth/me call is authenticated
      setAccessToken(res.accessToken)

      // Fetch authoritative user profile (includes role)
      const me = await Api.get<any>("/auth/me")

      // Map user with proper role handling (convert to lowercase for frontend consistency)
      const mappedUser: User = {
        id: me.id,
        email: me.email,
        name: me.name,
        role: (me.role?.toLowerCase() as User["role"]) || "client",
      }

      this.currentUser = mappedUser
      if (typeof window !== "undefined") {
        localStorage.setItem("sawerni_user", JSON.stringify(mappedUser))
      }
      this.notifyListeners()
      return { success: true, user: mappedUser }
    } catch (err: any) {
      // Extract error message from backend response format
      const errorMessage = err?.error || err?.message || "Login failed"
      let finalMessage = errorMessage
      
      // Handle specific error cases
      if (err?.status === 403) {
        finalMessage = "Email not verified or account disabled"
      } else if (err?.status === 401) {
        finalMessage = "Invalid email or password"
      } else if (err?.details?.issues) {
        // Handle validation errors
        finalMessage = err.details.issues[0]?.message || errorMessage
      }
      
      return { success: false, error: finalMessage }
    }
  }

  async signup(userData: {
    name: string
    email: string
    password: string
    role: "client" | "photographer"
    state?: string
    serviceType?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      await Api.post("/auth/register", {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      })
      // The backend requires email verification after registration. Do not auto-login.
      return { success: true }
    } catch (err: any) {
      // Extract error message from backend response format
      const errorMessage = err?.error || err?.message || "Signup failed"
      let finalMessage = errorMessage
      
      if (err?.details?.issues) {
        // Handle validation errors
        finalMessage = err.details.issues[0]?.message || errorMessage
      } else if (err?.status === 409) {
        finalMessage = "Email already exists"
      }
      
      return { success: false, error: finalMessage }
    }
  }

  logout() {
    this.currentUser = null
    setAccessToken(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("sawerni_user")
    }
    // fire-and-forget server logout to clear refresh cookie
    Api.post("/auth/logout").catch(() => {})
    this.notifyListeners()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && !!getAccessToken()
  }

  async loadCurrentUser(): Promise<User | null> {
    try {
      const me = await Api.get<any>("/auth/me")
      const mapped: User = {
        id: me.id,
        email: me.email,
        name: me.name,
        role: (me.role?.toLowerCase() as User["role"]) || "client",
        avatar: undefined,
      }
      this.currentUser = mapped
      if (typeof window !== "undefined") {
        localStorage.setItem("sawerni_user", JSON.stringify(mapped))
      }
      this.notifyListeners()
      return mapped
    } catch {
      return null
    }
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