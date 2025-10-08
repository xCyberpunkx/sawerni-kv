"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", phone: "", locale: "en", stateId: "" })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const me = await Api.get<any>("/me")
        setForm({ name: me.name || "", phone: me.phone || "", locale: me.locale || "en", stateId: me.state?.id || "" })
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
    try {
      await Api.put("/me", { name: form.name, phone: form.phone, locale: form.locale, stateId: form.stateId })
      await mockAuth.loadCurrentUser()
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
            <Input id="locale" value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State ID</Label>
            <Input id="state" value={form.stateId} onChange={(e) => setForm({ ...form, stateId: e.target.value })} />
          </div>

          <Button onClick={onSave} disabled={loading}>
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


