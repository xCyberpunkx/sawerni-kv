"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PremiumNavbar } from "@/components/premium-navbar"
import { PremiumFooter } from "@/components/premium-footer"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[50vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0">
          <img src="/hero-studio.jpg" alt="Contact Sawerni" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-6xl md:text-7xl text-balance mb-6 leading-tight text-white font-normal"
              style={{ fontFamily: "var(--font-adlam-display)" }}
            >
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto text-balance leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  content: "support@sawerni.com",
                  description: "We'll respond within 24 hours",
                },
                {
                  icon: Phone,
                  title: "Phone",
                  content: "+213 (0) 123 456 789",
                  description: "Available Monday to Friday",
                },
                {
                  icon: MapPin,
                  title: "Location",
                  content: "Algiers, Algeria",
                  description: "Serving all of Algeria",
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-8 border border-white/10 text-center hover:border-white/20 transition-all"
                  >
                    <Icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                    <p className="text-white font-semibold mb-2">{item.content}</p>
                    <p className="text-white/70 text-sm">{item.description}</p>
                  </div>
                )
              })}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-8 md:p-12 border border-white/10">
              <h2 className="text-3xl font-bold font-space-grotesk mb-8 text-white">Send us a Message</h2>

              {submitted ? (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 text-center">
                  <p className="text-green-300 font-semibold text-lg">Thank you for your message!</p>
                  <p className="text-green-300/80 mt-2">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg py-6 button-premium text-white shadow-2xl rounded-lg font-semibold border-2"
                    style={{
                      backgroundColor: "#283886",
                      borderColor: "#474EB8",
                    }}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PremiumFooter />
    </div>
  )
}
