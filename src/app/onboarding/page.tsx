"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  GENDER_OPTIONS,
  MAX_SCENTS,
  SCENT_OPTIONS,
  SPORTS_OPTIONS,
  SUPPORTING_COLORS,
} from "@/lib/constants";
import type { Gender } from "@/lib/types";

function toggle<T>(list: T[], value: T, max?: number): T[] {
  if (list.includes(value)) return list.filter((v) => v !== value);
  if (max && list.length >= max) return list;
  return [...list, value];
}

function calcAge(dob: string): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const prefilled = useRef(false);
  const isEditing = Boolean(profile?.onboardingComplete);

  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [sports, setSports] = useState<string[]>([]);
  const [otherInterests, setOtherInterests] = useState("");
  const [favoriteStores, setFavoriteStores] = useState("");
  const [favoriteFoods, setFavoriteFoods] = useState("");
  const [scents, setScents] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [favoritePlaces, setFavoritePlaces] = useState("");
  const [location, setLocation] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile || prefilled.current) return;
    prefilled.current = true;
    setDob(profile.dob ?? "");
    setGender(profile.gender ?? "");
    setSports(profile.sports ?? []);
    setOtherInterests(profile.otherInterests ?? "");
    setFavoriteStores(profile.favoriteStores ?? "");
    setFavoriteFoods(profile.favoriteFoods ?? "");
    setScents(profile.scents ?? []);
    setFavoriteColors(profile.favoriteColors ?? []);
    setFavoritePlaces(profile.favoritePlaces ?? "");
    setLocation(profile.location ?? "");
    setAllergies(profile.allergies ?? "");
  }, [profile]);

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      dob,
      age: calcAge(dob) ?? null,
      gender,
      sports,
      otherInterests,
      favoriteStores,
      favoriteFoods,
      scents,
      favoriteColors,
      favoritePlaces,
      location,
      allergies,
      themeColor: favoriteColors[0] ?? SUPPORTING_COLORS[0],
      onboardingComplete: true,
    });
    router.push(isEditing ? "/profile" : "/home");
  }

  return (
    <div className="flex-1 bg-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-3xl font-bold text-[#1f2430]">
          {isEditing ? "Edit your profile" : "Set up your profile"}
        </h1>
        <p className="mb-8 text-gray-500">
          Tell us about yourself so friends can find the perfect gift.
        </p>

        <Section title="About you">
          <label className="block text-sm font-medium text-gray-600">
            Date of birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mb-4 mt-1 w-full rounded-xl border border-gray-200 px-4 py-2"
          />
          <label className="block text-sm font-medium text-gray-600">Gender</label>
          <div className="mt-1 flex gap-2">
            {GENDER_OPTIONS.map((g) => (
              <Chip
                key={g}
                label={g}
                selected={gender === g}
                onClick={() => setGender(g)}
              />
            ))}
          </div>
        </Section>

        <Section title="Sports">
          <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-100 p-3">
            {SPORTS_OPTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={sports.includes(s)}
                onClick={() => setSports((prev) => toggle(prev, s))}
              />
            ))}
          </div>
        </Section>

        <Section title="Other interests">
          <textarea
            value={otherInterests}
            onChange={(e) => setOtherInterests(e.target.value)}
            placeholder="Anything else you're into..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2"
            rows={2}
          />
        </Section>

        <Section title="Favorite stores">
          <input
            value={favoriteStores}
            onChange={(e) => setFavoriteStores(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2"
          />
        </Section>

        <Section title="Favorite foods">
          <input
            value={favoriteFoods}
            onChange={(e) => setFavoriteFoods(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2"
          />
        </Section>

        <Section title={`Scent preferences (up to ${MAX_SCENTS})`}>
          <div className="flex flex-wrap gap-2">
            {SCENT_OPTIONS.map((s) => (
              <Chip
                key={s.name}
                label={s.name}
                title={s.description}
                selected={scents.includes(s.name)}
                onClick={() => setScents((prev) => toggle(prev, s.name, MAX_SCENTS))}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400">{scents.length}/{MAX_SCENTS} selected</p>
        </Section>

        <Section title="Favorite colors">
          <div className="flex flex-wrap gap-3">
            {SUPPORTING_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFavoriteColors((prev) => toggle(prev, c))}
                className="h-10 w-10 rounded-full ring-offset-2 transition"
                style={{
                  backgroundColor: c,
                  boxShadow: favoriteColors.includes(c)
                    ? "0 0 0 3px #1f2430"
                    : "0 0 0 1px rgba(0,0,0,0.1)",
                }}
                aria-label={c}
              />
            ))}
          </div>
        </Section>

        <Section title="Favorite places">
          <input
            value={favoritePlaces}
            onChange={(e) => setFavoritePlaces(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2"
          />
        </Section>

        <Section title="Location">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2"
          />
        </Section>

        <Section title="Allergies">
          <input
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2"
          />
        </Section>

        <button
          onClick={handleFinish}
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-[#ff9292] py-3 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : isEditing ? "Save changes" : "Finish setup"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-lg font-semibold text-[#1f2430]">{title}</h2>
      {children}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
  title,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        selected
          ? "border-[#52ebcf] bg-[#52ebcf]/20 text-[#1f2430]"
          : "border-gray-200 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}
