## Getting started

Wrapped is a [Next.js](https://nextjs.org) (App Router) web app styled with Tailwind CSS,
backed by [Firebase](https://firebase.google.com) (Auth + Firestore) and using the
[Claude API](https://docs.claude.com) to generate gift-idea suggestions.

### Option A — run it instantly, no Firebase project needed (Emulator Suite)

Good for trying the app locally. Data lives only in the emulators and resets
when you stop them; the AI gift-ideas feature needs a real `ANTHROPIC_API_KEY`
either way.

```bash
npm install
cp .env.example .env.local        # then set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
npm run dev:emulators              # terminal 1 — Firebase Auth + Firestore emulators
npm run dev                        # terminal 2 — Next.js dev server
```

Open http://localhost:3000 — the emulators accept any config values, so the
placeholder Firebase fields already in `.env.example` work as-is; you only
need to flip `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` to `true`.

### Option B — a real Firebase project (for actual deployment)

1. **Create a Firebase project** at https://console.firebase.google.com — enable
   **Authentication** (Email/Password provider) and **Firestore** (production mode).
2. Copy `.env.example` to `.env.local`, leave `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`,
   and fill in your Firebase web app config (Project settings → General → Your apps)
   and an `ANTHROPIC_API_KEY` from https://console.anthropic.com.
3. Deploy the security rules in `firestore.rules` to your Firebase project
   (`firebase deploy --only firestore:rules`, or paste them into the Firestore
   Rules tab in the console).
4. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000 — you'll see the splash screen, then be routed to
   sign up, complete your profile, and land on the home feed.

### What's built (MVP)

- Splash animation (logo → confetti → slogan → home)
- Email/password auth, profile setup wizard (all fields from the spec below)
- Home feed of friends, search + friend requests
- Friend profile pages with a private "gift notes" list per author (never mixed
  with the friend's own wishlist or other friends' notes) and a private
  "bought" mark on wishlist items (hidden from the recipient and other friends)
- Own profile + wishlist (like ❤ / mark-as-received 🎁 toggles)
- AI-generated gift ideas (Claude) for yourself or a friend, with "add to
  wishlist" / "add to friend's ideas" actions
- Anniversaries/yearly events per friend
- Firestore security rules enforcing the privacy rules above

### Known gaps / open questions (not yet specified or implemented)

- **Notifications**: the "did they like the gift?" prompt and event/anniversary
  reminders aren't wired up — no push/email notification service is configured.
- **Monetization** (affiliate links, premium tier, sponsorships): explicitly
  marked "tbd" in the spec — not implemented.
- **Image uploads**: Firebase Storage is initialized but there's no profile
  picture upload UI yet.
- **Friend search** is a simple name substring match — no privacy controls
  (e.g. "who can find me by search") have been decided.
- **Gift-idea privacy** in Firestore rules keys off splitting the `targetUid_authorUid`
  document id on `_`; this assumes Firebase Auth UIDs never contain an
  underscore (true today, but brittle if that ever changes).
- **Sports/scents lists** are hardcoded from the spec; "Other interests" is
  free text.

---

We will need to create a working app using AI throughout the next three days to assist friends, family, etc. in shopping for loved ones. This app will work similarly to many social media apps with feeds, customization for profiles, and other interesting features tbd. Profiles that connect to one another so you can search and find a friend and utilize their profile’s gift guide. 

The gifts that one adds to notes under their friend’s profiles are kept separate from those that the person themselves added so that if one of the friend’s ideas is wrong, it won’t interfere with the suggestions that others are given.

You can add information about what  you like to do with a person and their favorite things along with the gift ideas that you have already added and the app will generate further ideas in a separate link.
When one first enters the app, they set up their profile with name, email, etc. The app will then prompt them to set up their interests as part of the profile. 
Age 
Date of birth
Gender
Male 
Female
Prefer not to say
Sports
Allow them to select from a long list of sports that is provided below. 
American Soccer (Football)
Cricket
Basketball
Tennis
Volleyball
Table Tennis
Baseball
Golf
American Football
Rugby 
Badminton
Ice Hockey
Field Hockey
Boxing
Mixed Martial Arts (MMA)
Formula 1 Racing
Swimming
Athletics (Track & Field)
Cycling
Gymnastics
Wrestling
Skiing (Alpine)
Cross-Country Skiing
Snowboarding
Figure Skating
Speed Skating
Surfing
Skateboarding
Lacrosse
Softball
Handball
Water Polo
Polo
Squash
Racquetball
Fencing
Archery
Rowing
Canoeing
Kayaking
Sailing
Triathlon
Weightlifting
Powerlifting
Judo
Karate
Taekwondo
Brazilian Jiu-Jitsu
Muay Thai
Kickboxing
Billiards (Pool)
Snooker
Darts
Bowling
Equestrian (Show Jumping)
Dressage
Eventing
Sport Climbing
Ultimate Frisbee
Disc Golf
Pickleball
Chess
Cornhole
Cheerleading
DanceSport
Curling
Bobsleigh
Skeleton
Luge
Biathlon
Nordic Combined
Freestyle Skiing
Diving
Synchronized Swimming (Artistic Swimming)
Open Water Swimming
Fishing (Sport Fishing)
Dragon Boat Racing
Jet Ski Racing
Auto Racing (NASCAR)
Rally Racing
MotoGP (Motorcycle Racing)
Motocross
Speedway Motorcycle Racing
Netball
Sepak Takraw
Kabaddi
Gaelic Football
Hurling
Australian Rules Football
Extreme ironing
Other interests
 
Favorite stores
Allow the user to type this in
Favorite foods
Allow the user to type this in
Scent preferences 
 Provide options (select up to 10)
Vanilla – warm, sweet, creamy
Jasmine – rich, white floral
Rose – classic, fresh floral
Lavender – clean, herbal floral
Sandalwood – smooth, woody, creamy
Musk – soft, skin-like, sensual
Amber – warm, resinous, slightly sweet
Bergamot – bright, citrusy, slightly spicy
Cedarwood – dry, woody, earthy
Patchouli – earthy, rich, slightly sweet
Peony – light, fresh floral
Coconut – creamy, tropical, sweet
Lemon – crisp, zesty citrus
Orange Blossom – sweet, fresh white floral
Black Currant – fruity, tart, juicy
Favorite colors
On the users profile, under the favorite colors part of their list, this will show up in bubbles (like instagram highlights), but color circles
Favorite places
Allow the user to type this in
Location
Allow user to input
Allergies
Allow the user to type this in
Wishlist
Allow the user to write this in and under the scroll section of the app, each suggestion should have an add to wishlist option along with an add to friend’s ideas page option. There should also be a like button that will turn the main pink color when pressed. 

When one opens the app there should be a slide with the colors from our main color scheme that says “Wrapped” (the name of our app). Then, this wipes away and with confetti in the colors that are under our “Supporting colors” will pop up and fall, wiping away to show our app’s slogan, “Shift how you gift with Wrapped”. This will then fade out to show the homescreen of our app. The homescreen will be the user’s profiles for their friends and family. 
When one views their wishlist, they should be able to press a button that is a gift shape which means that they have already received a gift. 
When a friend or family member views their friend’s profile, they should be able to see their wishlist and there will be the same button that looks like a gift which then means that they have bought the gift for their friend and nobody else will be able to see the gift when they view that person’s wish list. 
If the person you were shopping for also has the app after they have received the gift a quick question could pop up on whether they enjoyed the gift or not this can be included in helping pick out future gifts for this person. If they don't have the app a question could pop up for the gift giver with a question if the person receiving the gift liked the gift.
Also add a section for anniversaries and yearly events that include all of the above. 
There will also be two sub tabs at the bottom in the same way that instagram has. One presses the “home” icon and sees their friend’s profiles. If one presses the profile icon, they will be brought to their own profile with the option to edit their preferences and interests. The watch icon which will look like the “play” icon and when they press this, it gives gift ideas that they may like, based on their age, input and interests.
Profiles that connect to one another so you can search and find a friend and utilize their profile’s gift guide.
The gifts that one adds to notes under their friend’s profiles are kept separate from those that the person themselves added so that if one of the friend’s ideas is wrong, it won’t interfere with the suggestions that others are given.
You can add information about what you like to do with a person and their favorite things along with the gift ideas that you have already added and the app will generate further ideas in a separate link.
Ways we could make money: we could use affiliate links when we are suggesting items for the consumer to buy and a link of the item. A premium subscription where you can give gifts as a group and coordinate with others as well as adding more friends (up to 10 friends/events could be free. Additionally we could get money from sponsorships and where companies could pay us to recommend their items and give us a discount code. 


Color Scheme
Main Colors: #52ebcfff,#ff9292ff,#ffff47ff
Supporting Colors(for each profile to put a color for each person and small other aesthetics around the app): #ff9292ff,#ff9900ff,#ffff47ff,#6cff6cff,#52ebcfff,#9fc5e8ff,#e892ffff
Font: Trebuchet MS
	Profiles should be customizable so that when someone adds a friend, they can upload a profile picture and change the color scheme that they see for the person. This could mean that when one clicks on their friend’s profile to see both the ideas that they have noted and when certain events related to the person occur.


