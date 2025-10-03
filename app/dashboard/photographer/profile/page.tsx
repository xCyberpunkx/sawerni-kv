"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Api } from "@/lib/api"
import { mockAuth } from "@/lib/auth"

export default function PhotographerProfilePage() {
  const user = mockAuth.getCurrentUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [locale, setLocale] = useState("")
  const [bio, setBio] = useState("")
  const [priceBaseline, setPriceBaseline] = useState<number | "">("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const me = await Api.get<any>("/auth/me")
        setName(me.name || "")
        setPhone(me.phone || "")
        setLocale(me.locale || "")
        setBio(me.photographer?.bio || "")
        setPriceBaseline(typeof me.photographer?.priceBaseline === "number" ? me.photographer.priceBaseline : "")
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (!user) {
    return <div className="p-6">Authentication required.</div>
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const payload: any = { name, phone, locale }
      payload.photographer = {
        bio: bio || undefined,
        priceBaseline: typeof priceBaseline === "number" ? priceBaseline : undefined,
      }
      await Api.put("/me", payload)
      setSuccess("Profile updated")
    } catch (e: any) {
      setError(e?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Update your personal and photographer information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Locale</Label>
            <Input value={locale} onChange={(e) => setLocale(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photographer</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Bio</Label>
            <Input value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div>
            <Label>Baseline Price (cents)</Label>
            <Input
              type="number"
              value={priceBaseline === "" ? "" : String(priceBaseline)}
              onChange={(e) => setPriceBaseline(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  )
}


