import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export function NavBar({ name, username }: { name: string; username: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/feed" className="text-lg font-semibold text-neutral-900">
          🎁 Wrapped
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
          <Link href="/feed" className="hover:text-rose-600">
            Feed
          </Link>
          <Link href="/friends" className="hover:text-rose-600">
            Friends
          </Link>
          <Link href={`/u/${username}`} className="hover:text-rose-600">
            My profile
          </Link>
          <span className="hidden text-neutral-400 sm:inline">Hi, {name.split(" ")[0]}</span>
          <form action={logoutAction}>
            <button type="submit" className="text-neutral-500 hover:text-rose-600">
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
