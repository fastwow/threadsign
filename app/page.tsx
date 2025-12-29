import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnvVarWarning } from "@/components/env-var-warning";
import { Accordion } from "@/components/ui/accordion";
import { PricingSection } from "@/components/pricing-section";
import { HeroSection } from "@/components/hero-section";
import logo from "@/app/logo.png";

export default function Home() {
  const faqItems = [
    {
      question: "How do we analyze ideas?",
      answer:
        "We use the official Reddit API to monitor selected, problem-heavy subreddits. Discussion threads are ingested periodically, and an LLM is used to extract pain signals and generate concise product ideas. Each idea includes a short pitch, key pain insight, and links back to the source thread for full context.",
    },
    {
      question: "How do we score pitches?",
      answer:
        "Each product idea receives a simplified viability score from 0 to 100. The scoring is heuristic-based and considers factors like the clarity of the pain point, the frequency of the problem mentioned, and the potential market size implied by the discussion. Scores help you quickly prioritize which ideas to explore further.",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="w-full border-b border-border">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Image
              src={logo}
              alt="ThreadSign"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span>ThreadSign</span>
          </Link>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

      {/* Hero Section */}
      <Suspense fallback={
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-16 w-full max-w-3xl bg-muted animate-pulse rounded" />
            <div className="h-6 w-full max-w-2xl bg-muted animate-pulse rounded" />
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-muted animate-pulse rounded" />
              <div className="h-12 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </section>
      }>
        <HeroSection />
      </Suspense>

      {/* Features Section */}
      <section className="w-full border-t border-border bg-card/50 py-20 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to discover and evaluate product ideas grounded in real user pain
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traceable to Reddit</CardTitle>
                <CardDescription>
                  Every idea links directly to its source thread, so you can verify the problem
                  and see the full discussion context.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Topic-Based Filtering</CardTitle>
                <CardDescription>
                  Filter ideas by topic (e.g., devtools, health) to focus on areas relevant
                  to your interests or expertise.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Viability Scoring</CardTitle>
                <CardDescription>
                  Each idea includes a simplified viability score (0–100) to help you quickly
                  evaluate potential.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Email Subscriptions</CardTitle>
                <CardDescription>
                  Subscribe to email updates by topic and receive periodic emails with new ideas
                  delivered to your inbox.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full border-t border-border py-20 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From Reddit discussions to actionable product ideas in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Monitor Subreddits</h3>
              <p className="text-muted-foreground">
                We monitor selected, problem-heavy subreddits using the official Reddit API,
                focusing on recent posts with quality signals.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Extract Pain Signals</h3>
              <p className="text-muted-foreground">
                Using LLM analysis, we extract pain points and frustrations from discussion
                threads, converting noise into signal.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Generate Ideas</h3>
              <p className="text-muted-foreground">
                We generate concise product ideas with viability scores, making it easy to
                browse, filter, and evaluate potential opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="w-full border-t border-border bg-card/50 py-20 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted By Founders</h2>
            <p className="text-muted-foreground text-lg">
              Join early-stage founders and indie hackers discovering validated problems
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold">JD</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">John Doe</CardTitle>
                    <CardDescription>Indie Hacker</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-base">
                  "ThreadSign helped me identify a real problem in the devtools space. The
                  traceability to Reddit threads gave me confidence in the validation."
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold">SM</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sarah Miller</CardTitle>
                    <CardDescription>Beginner Founder</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-base">
                  "As someone new to market research, ThreadSign made it easy to find
                  validated problems. The viability scores help me prioritize what to explore first."
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold">AC</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Alex Chen</CardTitle>
                    <CardDescription>Product Developer</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-base">
                  "The topic filtering and email subscriptions keep me updated on ideas
                  in my areas of interest. Highly recommend for product-oriented developers."
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full border-t border-border py-20 sm:py-24">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* Pricing Section */}
      <Suspense fallback={
        <section className="w-full border-t border-border bg-card/50 py-20 sm:py-24">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-10 w-32 bg-muted animate-pulse rounded mx-auto mb-4" />
              <div className="h-6 w-64 bg-muted animate-pulse rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        </section>
      }>
        <PricingSection />
      </Suspense>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="ThreadSign"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="font-semibold">ThreadSign</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ThreadSign. All rights reserved.
          </p>
          <ThemeSwitcher />
          </div>
        </div>
        </footer>
    </main>
  );
}
