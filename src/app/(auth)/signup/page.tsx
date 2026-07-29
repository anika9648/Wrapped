import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">🎁 Wrapped</h1>
        <p className="mt-1 text-sm text-neutral-500">Create an account to start building gift guides.</p>
      </div>
      <AuthForm
        action={signupAction}
        submitLabel="Create account"
        fields={[
          { name: "name", label: "Your name", type: "text", autoComplete: "name" },
          { name: "username", label: "Username", type: "text", autoComplete: "username" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
      />
      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
