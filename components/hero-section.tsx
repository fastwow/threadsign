import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export async function HeroSection() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const isAuthenticated = !!user;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative">
      {/* Subtle premium gradient background for hero area - purple → violet → magenta */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-950/15 via-violet-950/10 via-fuchsia-950/8 to-transparent rounded-3xl" />
      <div className="flex flex-col items-center text-center gap-8 relative">
        <Badge variant="secondary" className="mb-2">
          Product ideas from real discussion threads
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
          Find validated problems worth solving
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
          ThreadSign monitors Reddit discussions to extract pain signals and generates
          concise product ideas with viability scores. Built for founders who want
          real, validated problems, not noise.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {!isAuthenticated && (
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          )}
          <Button asChild size="lg" variant={isAuthenticated ? "default" : "outline"}>
            <Link href="/dashboard">Browse Ideas</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

