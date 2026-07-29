"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { EMOJI_CHOICES } from "@/lib/constants";

type ProfileUser = {
  bio: string;
  favoriteThings: string;
  activities: string;
  avatarEmoji: string;
};

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const [avatarEmoji, setAvatarEmoji] = useState(user.avatarEmoji);

  return (
    <form action={updateProfileAction} className="flex flex-col gap-5 rounded-lg border border-neutral-200 p-5">
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">Avatar</span>
        <input type="hidden" name="avatarEmoji" value={avatarEmoji} />
        <div className="flex flex-wrap gap-2">
          {EMOJI_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatarEmoji(emoji)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition ${
                avatarEmoji === emoji ? "bg-rose-100 ring-2 ring-rose-500" : "bg-neutral-100 hover:bg-neutral-200"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-neutral-700">Bio</span>
        <textarea
          name="bio"
          defaultValue={user.bio}
          rows={2}
          maxLength={500}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-neutral-700">Things you like to do</span>
        <span className="text-xs text-neutral-400">Friends see this to help pick gifts.</span>
        <textarea
          name="activities"
          defaultValue={user.activities}
          rows={3}
          maxLength={1000}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-neutral-700">Your favorite things</span>
        <span className="text-xs text-neutral-400">Colors, brands, hobbies, foods — anything helpful.</span>
        <textarea
          name="favoriteThings"
          defaultValue={user.favoriteThings}
          rows={3}
          maxLength={1000}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
      >
        Save profile
      </button>
    </form>
  );
}
