"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Gift, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import InfoSection from "@/components/InfoSection";
import {
  addEvent,
  addGiftIdea,
  getEvents,
  getGiftIdeas,
  getUserProfile,
  getWishlist,
  getWishlistBoughtMarks,
  markWishlistItemBought,
} from "@/lib/data";
import type { GiftEvent, GiftIdea, UserProfile, WishlistItem } from "@/lib/types";

export default function FriendProfilePage() {
  const { uid: targetUid } = useParams<{ uid: string }>();
  const { user } = useAuth();

  const [friend, setFriend] = useState<UserProfile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [boughtMarks, setBoughtMarks] = useState<Record<string, boolean>>({});
  const [ideas, setIdeas] = useState<GiftIdea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [events, setEvents] = useState<GiftEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  async function refresh() {
    if (!user || !targetUid) return;
    const p = await getUserProfile(targetUid);
    setFriend(p);
    const wl = await getWishlist(targetUid);
    setWishlist(wl);
    setBoughtMarks(await getWishlistBoughtMarks(targetUid, wl.map((w) => w.id), user.uid));
    setIdeas(await getGiftIdeas(targetUid, user.uid));
    const allEvents = await getEvents(user.uid);
    setEvents(allEvents.filter((e) => e.relatedUid === targetUid));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, targetUid]);

  async function handleToggleBought(itemId: string) {
    if (!user || !targetUid) return;
    const next = !boughtMarks[itemId];
    setBoughtMarks((prev) => ({ ...prev, [itemId]: next }));
    await markWishlistItemBought(targetUid, itemId, user.uid, next);
  }

  async function handleAddIdea() {
    if (!user || !targetUid || !newIdea.trim()) return;
    await addGiftIdea(targetUid, user.uid, newIdea.trim());
    setNewIdea("");
    setIdeas(await getGiftIdeas(targetUid, user.uid));
  }

  async function handleAddEvent() {
    if (!user || !targetUid || !newEventTitle.trim() || !newEventDate) return;
    await addEvent(user.uid, {
      title: newEventTitle.trim(),
      date: newEventDate,
      relatedUid: targetUid,
      recurringYearly: true,
    });
    setNewEventTitle("");
    setNewEventDate("");
    const allEvents = await getEvents(user.uid);
    setEvents(allEvents.filter((e) => e.relatedUid === targetUid));
  }

  if (!friend) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: friend.themeColor ?? "#ff9292" }}
        >
          {friend.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1f2430]">{friend.name}</h1>
          {friend.location && <p className="text-sm text-gray-500">{friend.location}</p>}
        </div>
      </div>

      <InfoSection label="Sports" value={friend.sports?.join(", ")} />
      <InfoSection label="Other interests" value={friend.otherInterests} />
      <InfoSection label="Favorite stores" value={friend.favoriteStores} />
      <InfoSection label="Favorite foods" value={friend.favoriteFoods} />
      <InfoSection label="Scent preferences" value={friend.scents?.join(", ")} />
      <InfoSection label="Favorite places" value={friend.favoritePlaces} />
      <InfoSection label="Allergies" value={friend.allergies} />

      {friend.favoriteColors?.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-500">Favorite colors</h2>
          <div className="flex gap-2">
            {friend.favoriteColors.map((c) => (
              <div key={c} className="h-8 w-8 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-[#1f2430]">
          {friend.name?.split(" ")[0]}&apos;s wishlist
        </h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-400">Nothing on their wishlist yet.</p>
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
                <button
                  onClick={() => handleToggleBought(item.id)}
                  title={boughtMarks[item.id] ? "Marked as bought (only you can see this)" : "Mark as bought"}
                >
                  <Gift
                    size={20}
                    color={boughtMarks[item.id] ? "#52ebcf" : "#c9cdd4"}
                    fill={boughtMarks[item.id] ? "#52ebcf" : "none"}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-semibold text-[#1f2430]">Your private gift notes</h2>
        <p className="mb-3 text-xs text-gray-400">
          Only visible to you — never mixed with {friend.name?.split(" ")[0]}&apos;s own wishlist
          or other friends&apos; notes.
        </p>
        <div className="mb-3 flex gap-2">
          <input
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Add a gift idea..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2"
          />
          <button
            onClick={handleAddIdea}
            className="rounded-xl bg-[#ff9292] px-4 py-2 font-semibold text-white"
          >
            Add
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {ideas.map((idea) => (
            <li key={idea.id} className="flex items-center gap-2 rounded-xl border border-gray-100 px-4 py-2">
              <Heart size={16} className="text-[#ff9292]" />
              <span>{idea.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-[#1f2430]">
          Anniversaries &amp; yearly events
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            placeholder="e.g. Birthday"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2"
          />
          <input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2"
          />
          <button
            onClick={handleAddEvent}
            className="rounded-xl bg-[#52ebcf] px-4 py-2 font-semibold text-[#1f2430]"
          >
            Add
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-2">
              <span>{e.title}</span>
              <span className="text-sm text-gray-500">{e.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
