import { Link } from "react-router-dom";
import { ArrowRight, Users, Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

const roles = [
  {
    icon: Users,
    title: "Students",
    description: "Streamlined course management and real-time progress tracking.",
  },
  {
    icon: Mic,
    title: "Lecturers",
    description: "Effortless grade recording and student engagement tools.",
  },
  {
    icon: Settings,
    title: "Admins",
    description: "Centralized institutional oversight and automated reporting.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              About SAGE
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Empowering academic excellence through smart guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-8 text-text-secondary">
              At SAGE, we believe that academic administration should be seamless, allowing educators and students to focus on what truly matters: learning and growth. Our platform integrates advanced data analytics with intuitive design to provide a centralized hub for university life.
            </p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Built for university students, lecturers, and administrators.
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <role.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Join thousands of institutions using SAGE to power the next generation of scholars.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
