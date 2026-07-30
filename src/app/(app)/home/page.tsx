"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  acceptFriendRequest,
  getFriendships,
  getUserProfile,
  searchUsersByName,
  sendFriendRequest,
} from "@/lib/data";
import type { Friendship, UserProfile } from "@/lib/types";

export default function HomePage() {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    const fs = (await getFriendships(user.uid)) as Friendship[];
    setFriendships(fs);
    const otherUids = fs.map((f) => f.users.find((u) => u !== user.uid)!).filter(Boolean);
    const profiles = await Promise.all(otherUids.map((uid) => getUserProfile(uid)));
    const map: Record<string, UserProfile> = {};
    profiles.forEach((p, i) => {
      if (p) map[otherUids[i]] = p;
    });
    setFriendProfiles(map);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSearch(term: string) {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    const results = await searchUsersByName(term);
    setSearchResults(results.filter((r) => r.uid !== user?.uid));
  }

  async function handleAdd(targetUid: string) {
    if (!user) return;
    await sendFriendRequest(user.uid, targetUid);
    await refresh();
  }

  async function handleAccept(otherUid: string) {
    if (!user) return;
    await acceptFriendRequest(user.uid, otherUid);
    await refresh();
  }

  if (!user) return null;

  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter(
    (f) => f.status === "pending" && f.requestedBy !== user.uid
  );

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-[#1f2430]">
        Hey {profile?.name?.split(" ")[0]} 👋
      </h1>

      <input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for a friend..."
        className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-2"
      />

      {searchResults.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-100 p-3">
          {searchResults.map((r) => (
            <div key={r.uid} className="flex items-center justify-between py-2">
              <span>{r.name}</span>
              <button
                onClick={() => handleAdd(r.uid)}
                className="rounded-full bg-[#52ebcf] px-3 py-1 text-sm font-semibold text-[#1f2430]"
              >
                Add friend
              </button>
            </div>
          ))}
        </div>
      )}

      {incoming.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-[#1f2430]">Friend requests</h2>
          {incoming.map((f) => {
            const otherUid = f.users.find((u) => u !== user.uid)!;
            const p = friendProfiles[otherUid];
            return (
              <div key={f.id} className="flex items-center justify-between py-2">
                <span>{p?.name ?? otherUid}</span>
                <button
                  onClick={() => handleAccept(otherUid)}
                  className="rounded-full bg-[#ff9292] px-3 py-1 text-sm font-semibold text-white"
                >
                  Accept
                </button>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-[#1f2430]">Your people</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : accepted.length === 0 ? (
        <p className="text-gray-400">
          No friends yet — search above to connect with someone.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {accepted.map((f) => {
            const otherUid = f.users.find((u) => u !== user.uid)!;
            const p = friendProfiles[otherUid];
            if (!p) return null;
            return (
              <Link
                key={f.id}
                href={`/friend/${otherUid}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 text-center"
                style={{ borderColor: p.themeColor ?? "#e5e7eb" }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: p.themeColor ?? "#ff9292" }}
                >
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#1f2430]">{p.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
