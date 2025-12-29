import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export async function PricingSection() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const isAuthenticated = !!user;

  // For MVP, all authenticated users are on the Free plan
  // Custom plan logic can be added later when billing is implemented
  const userPlan = isAuthenticated ? "free" : null;

  return (
    <section className="w-full border-t border-border bg-card/50 py-20 sm:py-24">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Choose the plan that works for you
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card
            className={
              userPlan === "free"
                ? "border-primary/50 ring-2 ring-primary/20"
                : ""
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Free</CardTitle>
                {userPlan === "free" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Current Plan
                  </span>
                )}
              </div>
              <CardDescription className="text-base mt-2">
                Get started with ThreadSign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">$0</div>
                <div className="text-muted-foreground">per month</div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Up to 10 pitches per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Access to idea feed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Topic-based filtering</span>
                </li>
              </ul>
              {!isAuthenticated && (
                <Button asChild className="w-full" size="lg">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              )}
              {isAuthenticated && (
                <Button asChild className="w-full" size="lg" variant="outline" disabled>
                  <span>Current Plan</span>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Custom Plan */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-2xl">Custom</CardTitle>
              <CardDescription className="text-base mt-2">
                For teams and power users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">Custom</div>
                <div className="text-muted-foreground">Contact us for pricing</div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited pitches</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All free features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button asChild className="w-full" size="lg" variant="outline">
                <a href="mailto:contact@threadsign.com">Contact Us</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

