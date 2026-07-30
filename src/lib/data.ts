import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GiftEvent, GiftIdea, UserProfile, WishlistItem } from "@/lib/types";

// ---------- Users ----------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function searchUsersByName(term: string): Promise<UserProfile[]> {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [];
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("name"), limit(50))
  );
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => u.name?.toLowerCase().includes(normalized));
}

// ---------- Friendships ----------

function friendshipId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("_");
}

export async function sendFriendRequest(currentUid: string, targetUid: string) {
  const id = friendshipId(currentUid, targetUid);
  await setDoc(doc(db, "friendships", id), {
    id,
    users: [currentUid, targetUid].sort(),
    requestedBy: currentUid,
    status: "pending",
    createdAt: Date.now(),
  });
}

export async function acceptFriendRequest(currentUid: string, otherUid: string) {
  const id = friendshipId(currentUid, otherUid);
  await updateDoc(doc(db, "friendships", id), { status: "accepted" });
}

export async function getFriendships(uid: string) {
  const snap = await getDocs(
    query(collection(db, "friendships"), where("users", "array-contains", uid))
  );
  return snap.docs.map((d) => d.data());
}

// ---------- Wishlist (own items, per user) ----------

export function wishlistCol(uid: string) {
  return collection(db, "users", uid, "wishlist");
}

export async function addWishlistItem(uid: string, text: string) {
  await addDoc(wishlistCol(uid), {
    text,
    liked: false,
    received: false,
    createdAt: Date.now(),
  });
}

export async function toggleWishlistField(
  uid: string,
  itemId: string,
  field: "liked" | "received",
  value: boolean
) {
  await updateDoc(doc(db, "users", uid, "wishlist", itemId), { [field]: value });
}

export async function getWishlist(uid: string): Promise<WishlistItem[]> {
  const snap = await getDocs(query(wishlistCol(uid), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem));
}

// A friend marking a wishlist item "bought" is private to that friend: stored
// under the item itself, keyed by their own uid, so the wishlist owner and
// every other friend never see it.

export async function markWishlistItemBought(
  targetUid: string,
  itemId: string,
  viewerUid: string,
  bought: boolean
) {
  await setDoc(
    doc(db, "users", targetUid, "wishlist", itemId, "boughtBy", viewerUid),
    { bought },
    { merge: true }
  );
}

export async function getWishlistBoughtMarks(
  targetUid: string,
  itemIds: string[],
  viewerUid: string
): Promise<Record<string, boolean>> {
  const marks: Record<string, boolean> = {};
  await Promise.all(
    itemIds.map(async (itemId) => {
      const snap = await getDoc(
        doc(db, "users", targetUid, "wishlist", itemId, "boughtBy", viewerUid)
      );
      if (snap.exists()) marks[itemId] = Boolean(snap.data().bought);
    })
  );
  return marks;
}

// ---------- Gift ideas (private per author, scoped to a target friend) ----------
// Stored at giftIdeas/{targetUid}_{authorUid}/items/{itemId} so a friend's
// guesses never mix with the target's own wishlist, and each author's notes
// stay separate from every other friend's notes about the same person.

function giftIdeaDocId(targetUid: string, authorUid: string) {
  return `${targetUid}_${authorUid}`;
}

export function giftIdeasCol(targetUid: string, authorUid: string) {
  return collection(db, "giftIdeas", giftIdeaDocId(targetUid, authorUid), "items");
}

export async function addGiftIdea(targetUid: string, authorUid: string, text: string) {
  await addDoc(giftIdeasCol(targetUid, authorUid), {
    text,
    authorUid,
    createdAt: Date.now(),
  });
}

export async function getGiftIdeas(
  targetUid: string,
  authorUid: string
): Promise<GiftIdea[]> {
  const snap = await getDocs(
    query(giftIdeasCol(targetUid, authorUid), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GiftIdea));
}

// "Bought" marks are private to the author who marked them: stored in a
// subcollection keyed by the author's own uid, readable only by that author,
// so the gift recipient (and other friends) never see it.

export async function markGiftBought(
  targetUid: string,
  authorUid: string,
  ideaId: string,
  bought: boolean
) {
  await setDoc(
    doc(db, "giftIdeas", giftIdeaDocId(targetUid, authorUid), "boughtMarks", authorUid),
    { [ideaId]: bought },
    { merge: true }
  );
}

export async function getBoughtMarks(
  targetUid: string,
  authorUid: string
): Promise<Record<string, boolean>> {
  const snap = await getDoc(
    doc(db, "giftIdeas", giftIdeaDocId(targetUid, authorUid), "boughtMarks", authorUid)
  );
  return snap.exists() ? (snap.data() as Record<string, boolean>) : {};
}

// ---------- Events (anniversaries / yearly events) ----------

export function eventsCol(uid: string) {
  return collection(db, "users", uid, "events");
}

export async function addEvent(
  uid: string,
  event: Omit<GiftEvent, "id" | "createdAt">
) {
  await addDoc(eventsCol(uid), { ...event, createdAt: Date.now() });
}

export async function getEvents(uid: string): Promise<GiftEvent[]> {
  const snap = await getDocs(query(eventsCol(uid), orderBy("date")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GiftEvent));
}

export async function deleteEvent(uid: string, eventId: string) {
  await deleteDoc(doc(db, "users", uid, "events", eventId));
}
