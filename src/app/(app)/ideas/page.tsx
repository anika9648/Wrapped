"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addGiftIdea,
  addWishlistItem,
  getFriendships,
  getGiftIdeas,
  getUserProfile,
  getWishlist,
} from "@/lib/data";
import type { Friendship, UserProfile } from "@/lib/types";

export default function IdeasPage() {
  const { user, profile } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [targetUid, setTargetUid] = useState<string>("self");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, "wishlist" | "notes">>({});

  useEffect(() => {
    async function loadFriends() {
      if (!user) return;
      const fs = (await getFriendships(user.uid)) as Friendship[];
      const accepted = fs.filter((f) => f.status === "accepted");
      const otherUids = accepted.map((f) => f.users.find((u) => u !== user.uid)!);
      const profiles = await Promise.all(otherUids.map((uid) => getUserProfile(uid)));
      setFriends(profiles.filter(Boolean) as UserProfile[]);
    }
    loadFriends();
  }, [user]);

  async function handleGenerate() {
    if (!user) return;
    setLoading(true);
    setError(null);
    setAdded({});
    try {
      const isSelf = targetUid === "self";
      const targetProfile = isSelf ? profile : friends.find((f) => f.uid === targetUid);
      if (!targetProfile) throw new Error("Pick someone first.");

      const existingIdeas = isSelf
        ? (await getWishlist(user.uid)).map((w) => w.text)
        : (await getGiftIdeas(targetUid, user.uid)).map((i) => i.text);

      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: targetProfile.name,
          interests: {
            sports: targetProfile.sports,
            otherInterests: targetProfile.otherInterests,
            favoriteStores: targetProfile.favoriteStores,
            favoriteFoods: targetProfile.favoriteFoods,
            scents: targetProfile.scents,
            favoritePlaces: targetProfile.favoritePlaces,
            allergies: targetProfile.allergies,
          },
          existingIdeas,
        }),
      });
      if (!res.ok) throw new Error("Could not generate ideas right now.");
      const data = await res.json();
      setIdeas(data.ideas ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToWishlist(idea: string) {
    if (!user) return;
    await addWishlistItem(user.uid, idea);
    setAdded((prev) => ({ ...prev, [idea]: "wishlist" }));
  }

  async function handleAddToFriendNotes(idea: string) {
    if (!user || targetUid === "self") return;
    await addGiftIdea(targetUid, user.uid, idea);
    setAdded((prev) => ({ ...prev, [idea]: "notes" }));
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-[#1f2430]">Gift ideas</h1>
      <p className="mb-4 text-gray-500">
        Get AI-generated suggestions based on interests and notes.
      </p>

      <select
        value={targetUid}
        onChange={(e) => setTargetUid(e.target.value)}
        className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-2"
      >
        <option value="self">For myself</option>
        {friends.map((f) => (
          <option key={f.uid} value={f.uid}>
            For {f.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-6 w-full rounded-xl bg-[#ffff47] py-3 font-semibold text-[#1f2430] disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate ideas"}
      </button>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <ul className="flex flex-col gap-3">
        {ideas.map((idea) => (
          <li key={idea} className="rounded-xl border border-gray-100 p-4">
            <p className="mb-2 text-[#1f2430]">{idea}</p>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => handleAddToWishlist(idea)}
                className="rounded-full bg-[#52ebcf]/30 px-3 py-1 font-semibold text-[#1f2430]"
              >
                {added[idea] === "wishlist" ? "Added to wishlist ✓" : "Add to wishlist"}
              </button>
              {targetUid !== "self" && (
                <button
                  onClick={() => handleAddToFriendNotes(idea)}
                  className="rounded-full bg-[#ff9292]/30 px-3 py-1 font-semibold text-[#1f2430]"
                >
                  {added[idea] === "notes" ? "Added to notes ✓" : "Add to friend's ideas"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
