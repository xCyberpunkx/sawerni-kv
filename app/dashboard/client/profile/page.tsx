"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({ name: "", phone: "", locale: "en", stateId: "" })
  const [states, setStates] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      setSuccess("")
      try {
        const me = await Api.get<any>("/me")
        setForm({ name: me.name || "", phone: me.phone || "", locale: me.locale || "en", stateId: me.state?.id || "" })
        try {
          const res = await Api.get<{ items: Array<{ id: string; name: string }>; meta?: any }>("/states?page=1&perPage=100")
          setStates((res.items || []).map((s) => ({ id: s.id, name: s.name })))
        } catch {
          // non-fatal
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      await Api.put("/me", { name: form.name, phone: form.phone, locale: form.locale, stateId: form.stateId })
      await mockAuth.loadCurrentUser()
      setSuccess("Profile updated successfully")
    } catch (e: any) {
      setError(e?.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-emerald-600">{success}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale">Language</Label>
            <Select value={form.locale} onValueChange={(v) => setForm({ ...form, locale: v })}>
              <SelectTrigger id="locale">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={form.stateId} onValueChange={(v) => setForm({ ...form, stateId: v })}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onSave} disabled={loading}>
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


