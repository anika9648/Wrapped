import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">🎁 Wrapped</h1>
        <p className="mt-1 text-sm text-neutral-500">Log in to keep planning great gifts.</p>
      </div>
      <AuthForm
        action={loginAction}
        submitLabel="Log in"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
      />
      <p className="text-sm text-neutral-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-rose-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
