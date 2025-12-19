"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "@/hooks/useTranslations"

export default function ContactUsPage() {
  const { t } = useTranslations()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setIsSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      toast.success(t("contactUs.messageSentSuccess"))
    } catch (error) {
      toast.error(t("contactUs.messageSentError"))
      console.error("Error sending message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-16 lg:pt-20 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-green-100 dark:bg-green-900 w-fit">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">{t("contactUs.messageSent")}</CardTitle>
            <CardDescription>
              {t("contactUs.messageSentDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setIsSubmitted(false)}
            >
              {t("contactUs.sendAnotherMessage")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              {t("contactUs.title")} <span style={{color: 'hsl(var(--primary))'}}>{t("contactUs.titleHighlight")}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              {t("contactUs.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t("contactUs.getInTouch")}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t("contactUs.email")}</h3>
                    <a href="mailto:mohamedmoamen1230@gmail.com" className="text-primary hover:underline">
                      mohamedmoamen1230@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Phone className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t("contactUs.support")}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t("contactUs.supportHours")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t("contactUs.responseTime")}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t("contactUs.responseTimeDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t("contactUs.sendUsMessage")}</CardTitle>
                <CardDescription>
                  {t("contactUs.sendUsMessageDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("common.name")} *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("contactUs.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("common.email")} *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contactUs.emailPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">{t("common.subject")} *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("contactUs.subjectPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">{t("common.message")} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contactUs.messagePlaceholder")}
                      rows={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      t("contactUs.sending")
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("contactUs.sendMessage")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

