import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[radial-gradient(80%_80%_at_50%50%,rgba(168,85,247,0.25),transparent_70%)] bg-background">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
