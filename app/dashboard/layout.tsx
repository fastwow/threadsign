import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import logo from "@/app/logo.png";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-[radial-gradient(80%_80%_at_50%50%,rgba(168,85,247,0.25),transparent_70%)] bg-background">
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
          {!hasEnvVars ? null : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </nav>
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  );
}
