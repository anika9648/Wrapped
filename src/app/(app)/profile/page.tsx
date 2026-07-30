"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { Gift, Heart } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import InfoSection from "@/components/InfoSection";
import { addWishlistItem, getWishlist, toggleWishlistField } from "@/lib/data";
import type { WishlistItem } from "@/lib/types";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [newItem, setNewItem] = useState("");

  async function refresh() {
    if (!user) return;
    setWishlist(await getWishlist(user.uid));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAdd() {
    if (!user || !newItem.trim()) return;
    await addWishlistItem(user.uid, newItem.trim());
    setNewItem("");
    await refresh();
  }

  async function handleToggle(itemId: string, field: "liked" | "received", value: boolean) {
    if (!user) return;
    setWishlist((prev) =>
      prev.map((w) => (w.id === itemId ? { ...w, [field]: value } : w))
    );
    await toggleWishlistField(user.uid, itemId, field, value);
  }

  if (!profile || !user) return null;

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: profile.themeColor ?? "#ff9292" }}
          >
            {profile.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f2430]">{profile.name}</h1>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
        <Link
          href="/onboarding"
          className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-[#1f2430]"
        >
          Edit
        </Link>
      </div>

      <InfoSection label="Sports" value={profile.sports?.join(", ")} />
      <InfoSection label="Other interests" value={profile.otherInterests} />
      <InfoSection label="Favorite stores" value={profile.favoriteStores} />
      <InfoSection label="Favorite foods" value={profile.favoriteFoods} />
      <InfoSection label="Scent preferences" value={profile.scents?.join(", ")} />
      <InfoSection label="Favorite places" value={profile.favoritePlaces} />
      <InfoSection label="Location" value={profile.location} />
      <InfoSection label="Allergies" value={profile.allergies} />

      {profile.favoriteColors?.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Favorite colors</h2>
          <div className="flex gap-2">
            {profile.favoriteColors.map((c) => (
              <div key={c} className="h-8 w-8 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-[#1f2430]">Your wishlist</h2>
        <div className="mb-3 flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add something you'd love to receive..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-[#ff9292] px-4 py-2 font-semibold text-white"
          >
            Add
          </button>
        </div>
        {wishlist.length === 0 ? (
          <p className="text-gray-400">Your wishlist is empty.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {wishlist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <span className={item.received ? "text-gray-400 line-through" : ""}>
                  {item.text}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item.id, "liked", !item.liked)}
                    title="Like"
                  >
                    <Heart
                      size={20}
                      color={item.liked ? "#ff9292" : "#c9cdd4"}
                      fill={item.liked ? "#ff9292" : "none"}
                    />
                  </button>
                  <button
                    onClick={() => handleToggle(item.id, "received", !item.received)}
                    title="Mark as received"
                  >
                    <Gift
                      size={20}
                      color={item.received ? "#52ebcf" : "#c9cdd4"}
                      fill={item.received ? "#52ebcf" : "none"}
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={() => signOut(auth)}
        className="w-full rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-500"
      >
        Log out
      </button>
    </div>
  );
}
