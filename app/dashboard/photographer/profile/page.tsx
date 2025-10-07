"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Api } from "@/lib/api"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [locale, setLocale] = useState("en")
  const [bio, setBio] = useState("")
  const [priceBaseline, setPriceBaseline] = useState<number>(0)
  const [tags, setTags] = useState<string>("")
  const [stateId, setStateId] = useState<string>("")
  const [serviceIds, setServiceIds] = useState<string>("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const me = await Api.get<any>("/auth/me")
        setName(me?.name || "")
        setPhone(me?.phone || "")
        setLocale(me?.locale || "en")
        setBio(me?.photographer?.bio || "")
        setPriceBaseline(me?.photographer?.priceBaseline || 0)
        setStateId(me?.photographer?.state?.id || me?.state?.id || "")
        setServiceIds((me?.photographer?.services || []).map((s: any) => s.id).join(","))
        setTags((me?.photographer?.tags || []).join(","))
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setError("")
    try {
      const body: any = {
        name,
        phone,
        locale,
        stateId: stateId || undefined,
      }
      body.photographer = {
        bio,
        priceBaseline: Number(priceBaseline) || 0,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        stateId: stateId || undefined,
        serviceIds: serviceIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      }
      const res = await Api.put<any>("/me", body)
      // reflect UI with updated values
      setName(res?.name || name)
      setPhone(res?.phone || phone)
    } catch (e: any) {
      const message = e?.details?.issues?.[0]?.message || e?.message || "Failed to save"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Update your personal and photographer profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Locale</Label>
              <Input value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="en | ar" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photographer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Base Price (DA)</Label>
              <Input type="number" value={priceBaseline} onChange={(e) => setPriceBaseline(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>State ID</Label>
              <Input value={stateId} onChange={(e) => setStateId(e.target.value)} placeholder="CUID" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Services (IDs, comma-separated)</Label>
              <Input value={serviceIds} onChange={(e) => setServiceIds(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" className="bg-transparent" onClick={() => window.location.reload()}>Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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


