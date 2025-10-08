"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Api } from "@/lib/api"
import { MapPin, Globe, Phone, Mail, User, Save, Loader2, Award, Camera, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("personal")

  // User Information
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [locale, setLocale] = useState("en")

  // Photographer Information
  const [bio, setBio] = useState("")
  const [priceBaseline, setPriceBaseline] = useState<number>(0)
  const [experience, setExperience] = useState<string>("")

  // Location
  const [stateId, setStateId] = useState<string>("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")

  // Services
  const [serviceIds, setServiceIds] = useState<string>("")
  const [tags, setTags] = useState<string>("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const me = await Api.get<any>("/auth/me")
        
        // User data
        setName(me?.name || "")
        setPhone(me?.phone || "")
        setEmail(me?.email || "")
        setLocale(me?.locale || "en")

        // Photographer data
        const photographer = me?.photographer || {}
        setBio(photographer?.bio || "")
        setPriceBaseline(photographer?.priceBaseline || 0)
        setExperience(photographer?.experience || "")
        
        // Location data
        setStateId(photographer?.state?.id || me?.state?.id || "")
        setCity(photographer?.city || "")
        setAddress(photographer?.address || "")

        // Services data
        setServiceIds((photographer?.services || []).map((s: any) => s.id).join(","))
        setTags((photographer?.tags || []).join(","))

      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const body: any = {
        name,
        phone,
        email,
        locale,
        stateId: stateId || undefined,
      }
      body.photographer = {
        bio,
        priceBaseline: Number(priceBaseline) || 0,
        experience,
        city,
        address,
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
      // Update UI with response
      setName(res?.name || name)
      setPhone(res?.phone || phone)
      setEmail(res?.email || email)
    } catch (e: any) {
      const message = e?.details?.issues?.[0]?.message || e?.message || "Failed to save"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal and professional information</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Error saving profile</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarFallback className="text-lg">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-bold">{name || "Photographer"}</h2>
                  <p className="text-muted-foreground">Professional Photographer</p>
                </div>

                {city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{city}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Forms */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+213 XXX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locale">Language</Label>
                      <Select value={locale} onValueChange={setLocale}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stateId">State/Region</Label>
                      <Input
                        id="stateId"
                        value={stateId}
                        onChange={(e) => setStateId(e.target.value)}
                        placeholder="Enter state ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your complete address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Information Tab */}
            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell clients about your photography style, experience, and what makes you unique..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      This will be displayed on your public profile
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceBaseline">Base Price (DA) *</Label>
                      <Input
                        id="priceBaseline"
                        type="number"
                        value={priceBaseline}
                        onChange={(e) => setPriceBaseline(Number(e.target.value))}
                        placeholder="15000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceIds">Service IDs</Label>
                    <Input
                      id="serviceIds"
                      value={serviceIds}
                      onChange={(e) => setServiceIds(e.target.value)}
                      placeholder="comma-separated service IDs"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter service IDs separated by commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags & Keywords</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="wedding, portrait, event, commercial"
                    />
                    <p className="text-sm text-muted-foreground">
                      Add relevant tags to help clients find you
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}