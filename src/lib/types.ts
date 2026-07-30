export type Gender = "Male" | "Female" | "Prefer not to say" | "";

export interface WishlistItem {
  id: string;
  text: string;
  liked: boolean;
  received: boolean;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  dob?: string;
  age?: number;
  gender?: Gender;
  sports: string[];
  otherInterests?: string;
  favoriteStores?: string;
  favoriteFoods?: string;
  scents: string[];
  favoriteColors: string[];
  favoritePlaces?: string;
  location?: string;
  allergies?: string;
  themeColor?: string;
  onboardingComplete: boolean;
  createdAt: number;
}

export type FriendshipStatus = "pending" | "accepted";

export interface Friendship {
  id: string;
  users: [string, string];
  requestedBy: string;
  status: FriendshipStatus;
  createdAt: number;
}

export interface GiftIdea {
  id: string;
  text: string;
  authorUid: string;
  createdAt: number;
}

export interface GiftEvent {
  id: string;
  title: string;
  date: string;
  relatedUid: string;
  recurringYearly: boolean;
  createdAt: number;
}
