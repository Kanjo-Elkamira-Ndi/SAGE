import { Link } from "react-router-dom";
import { Send, MapPin, Mail, Phone, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const contactInfo = [
  {
    icon: MapPin,
    label: "Office",
    lines: ["University Academic Plaza", "Suite 405, Tech District"],
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["admin@sage-engine.edu", "support@sage-engine.edu"],
  },
  {
    icon: Phone,
    label: "Phone",
    lines: ["+1 (555) 892-0431", "Mon-Fri, 9am-5pm EST"],
  },
  {
    icon: BookOpen,
    label: "Institution",
    lines: ["Global Research University", "Faculty of Data Science"],
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Connect with the Smart Academy Guidance Engine team. Whether you're an educator seeking support or a student exploring opportunities, we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-text-primary">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-text-primary">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-text-primary">
                      Message
                    </label>
                    <Textarea id="message" placeholder="How can we help?" rows={5} />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{info.label}</h3>
                    <div className="mt-1 text-text-secondary">
                      {info.lines.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold text-primary">
              Need immediate help?
            </h2>
            <p className="mt-2 text-text-secondary">
              Check our extensive documentation or visit the student help center.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button variant="secondary" asChild>
                <Link to="/docs">
                  Documentation
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/help">
                  Help Center
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
