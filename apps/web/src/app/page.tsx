import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Sparkles, Users, Zap, Lock, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Lock className="mr-2 h-3 w-3" />
              Closed Demo - Limited Access
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Employee Surveys,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Powered by Voice AI
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              Transform employee feedback with intelligent voice-guided surveys.
              Create, distribute, and analyze surveys effortlessly.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <SignedOut>
                <Button asChild size="lg" className="text-lg h-12 px-8">
                  <Link href="/sign-in">Get Started</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild size="lg" className="text-lg h-12 px-8">
                  <Link href="/forms">View Dashboard</Link>
                </Button>
              </SignedIn>
              <Button asChild variant="outline" size="lg" className="text-lg h-12 px-8">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Agent Highlight */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-background px-6 py-3 shadow-lg border">
              <Mic className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">
                AI Voice Agent: Guide employees through surveys naturally with conversational AI
              </span>
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need for employee surveys
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features designed for modern HR teams
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Drag & Drop Builder</h3>
              <p className="text-muted-foreground">
                Create surveys in minutes with our intuitive form builder. No coding required.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Voice-Guided Surveys</h3>
              <p className="text-muted-foreground">
                AI voice agent helps employees complete surveys naturally through conversation.
              </p>
              <Badge variant="outline" className="mt-2">Demo Only</Badge>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Share surveys with your team, manage tokens, and track submissions in real-time.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Instant Distribution</h3>
              <p className="text-muted-foreground">
                Generate secure links and tokens. Send surveys to employees instantly.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Token-based access, rate limiting, and cookie tracking prevent spam and ensure data integrity.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                View submissions, export data, and analyze feedback as it comes in.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Ready to transform your employee surveys?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join the closed demo and experience the future of employee feedback.
            </p>
            <SignedOut>
              <Button asChild size="lg" className="text-lg h-12 px-8">
                <Link href="/sign-in">Request Access</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="text-lg h-12 px-8">
                <Link href="/forms">Go to Dashboard</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 Survy. Closed Demo Version.
            </p>
            <div className="flex gap-6">
              <Link href="/forms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <SignedOut>
                <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
