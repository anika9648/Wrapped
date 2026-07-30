"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Play } from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/ideas", label: "Ideas", icon: Play },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 flex justify-around border-t border-gray-100 bg-white/95 py-2 backdrop-blur">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Icon
              size={24}
              strokeWidth={active ? 2.5 : 1.8}
              color={active ? "#ff9292" : "#9aa1ad"}
              fill={active && href === "/ideas" ? "#ff9292" : "none"}
            />
            <span
              className={`text-xs ${active ? "font-semibold text-[#1f2430]" : "text-gray-400"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
