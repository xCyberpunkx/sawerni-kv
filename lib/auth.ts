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
      const mappedUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: ((res.user.role || "client").toString().toLowerCase() as any),
      }
      setAccessToken(res.accessToken)
      this.currentUser = mappedUser
      if (typeof window !== "undefined") {
        localStorage.setItem("sawerni_user", JSON.stringify(mappedUser))
      }
      this.notifyListeners()
      return { success: true, user: mappedUser }
    } catch (err: any) {
      const message = err?.status === 403 ? "Email not verified or account disabled" : err?.message || "Login failed"
      return { success: false, error: message }
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
      const message = err?.message || "Signup failed"
      return { success: false, error: message }
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
        role: (me.role || "client").toString().toLowerCase() as any,
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
