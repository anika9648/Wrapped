export type GiftSuggestion = { title: string; description: string };

type KeywordEntry = { keywords: string[]; ideas: GiftSuggestion[] };

// Rule-based placeholder generator: matches keywords found in the author's
// notes / gift ideas / the subject's self-reported interests against a small
// curated catalog. Swap `generateGiftIdeas` for a real Claude API call later
// without touching any caller — the function signature is the contract.
const CATALOG: KeywordEntry[] = [
  {
    keywords: ["coffee", "espresso", "latte", "barista"],
    ideas: [
      { title: "Specialty coffee bean subscription", description: "A rotating selection from local roasters." },
      { title: "Pour-over coffee dripper set", description: "For a slower, more deliberate morning brew." },
    ],
  },
  {
    keywords: ["tea", "matcha"],
    ideas: [
      { title: "Loose-leaf tea sampler", description: "A curated set of teas from around the world." },
      { title: "Cast-iron teapot with infuser", description: "Keeps tea hot longer and looks great on a shelf." },
    ],
  },
  {
    keywords: ["cook", "cooking", "baking", "bake", "kitchen", "chef"],
    ideas: [
      { title: "Cooking class for two", description: "A local hands-on class in a cuisine they haven't tried." },
      { title: "Cast-iron skillet", description: "A kitchen staple that lasts a lifetime." },
    ],
  },
  {
    keywords: ["read", "reading", "book", "books", "novel"],
    ideas: [
      { title: "Indie bookstore gift card", description: "Let them pick their next favorite read." },
      { title: "Cozy reading blanket + book light", description: "For late-night chapters." },
    ],
  },
  {
    keywords: ["hike", "hiking", "camping", "outdoors", "trail", "backpack"],
    ideas: [
      { title: "Insulated hiking water bottle", description: "Keeps drinks cold on long trails." },
      { title: "National/state park annual pass", description: "Unlimited outdoor adventures for a year." },
    ],
  },
  {
    keywords: ["yoga", "fitness", "gym", "workout", "running", "run"],
    ideas: [
      { title: "Non-slip yoga mat", description: "A quality upgrade for their practice." },
      { title: "Wireless workout earbuds", description: "Sweat-resistant and secure fit for training." },
    ],
  },
  {
    keywords: ["music", "guitar", "vinyl", "records", "concert", "band"],
    ideas: [
      { title: "Vinyl record from a favorite artist", description: "Check their collection for what's missing." },
      { title: "Concert tickets", description: "See a favorite artist live." },
    ],
  },
  {
    keywords: ["game", "gaming", "video game", "console", "board game", "puzzle"],
    ideas: [
      { title: "New release board game", description: "A well-reviewed game for game nights." },
      { title: "Gift card for their gaming platform", description: "Lets them choose their next game." },
    ],
  },
  {
    keywords: ["art", "paint", "painting", "draw", "drawing", "sketch"],
    ideas: [
      { title: "Artist-grade sketchbook + pencil set", description: "For someone who's always doodling." },
      { title: "Local art class or museum membership", description: "A creative day out." },
    ],
  },
  {
    keywords: ["photo", "photography", "camera"],
    ideas: [
      { title: "Instant film camera", description: "Fun for capturing everyday moments." },
      { title: "Camera strap or bag", description: "A practical upgrade for their gear." },
    ],
  },
  {
    keywords: ["travel", "trip", "vacation", "flight", "passport"],
    ideas: [
      { title: "Packing cubes + travel organizer set", description: "Makes any trip easier to pack for." },
      { title: "Experience gift card for their next destination", description: "A tour or activity wherever they're headed." },
    ],
  },
  {
    keywords: ["plant", "plants", "garden", "gardening", "succulent"],
    ideas: [
      { title: "Rare houseplant", description: "Something to add to their growing collection." },
      { title: "Beginner-friendly garden tool set", description: "For weekend gardening projects." },
    ],
  },
  {
    keywords: ["tech", "gadget", "gadgets", "coding", "programmer", "computer"],
    ideas: [
      { title: "Mechanical keyboard", description: "A satisfying upgrade for daily typing." },
      { title: "Smart home gadget", description: "Something fun and useful for their space." },
    ],
  },
  {
    keywords: ["movie", "movies", "film", "cinema", "tv show"],
    ideas: [
      { title: "Streaming service gift subscription", description: "A few months of their favorite platform." },
      { title: "Movie night basket", description: "Popcorn, candy, and a cozy blanket." },
    ],
  },
  {
    keywords: ["wine", "cocktail", "cocktails", "beer", "whiskey"],
    ideas: [
      { title: "Cocktail-making kit", description: "Everything needed for a signature drink at home." },
      { title: "Local winery or brewery tasting", description: "A relaxed outing to try something new." },
    ],
  },
  {
    keywords: ["dog", "cat", "pet", "puppy", "kitten"],
    ideas: [
      { title: "Custom pet portrait", description: "A keepsake featuring their pet." },
      { title: "Premium pet toy or treat box", description: "Something their furry friend will love too." },
    ],
  },
  {
    keywords: ["knit", "knitting", "craft", "crafts", "sewing"],
    ideas: [
      { title: "Craft supply set", description: "High-quality materials for their next project." },
      { title: "Subscription craft kit box", description: "A new guided project delivered monthly." },
    ],
  },
  {
    keywords: ["basketball", "football", "soccer", "golf", "tennis", "sports"],
    ideas: [
      { title: "Tickets to a live game", description: "See their favorite team play." },
      { title: "Team jersey or gear", description: "Something to wear on game day." },
    ],
  },
  {
    keywords: ["ski", "skiing", "snowboard", "snowboarding"],
    ideas: [
      { title: "Heated gloves or thermal gear", description: "Keeps them warm on the slopes." },
      { title: "Lift ticket or lesson package", description: "A day (or lesson) at their favorite resort." },
    ],
  },
  {
    keywords: ["bike", "biking", "cycling", "cyclist"],
    ideas: [
      { title: "Bike multi-tool + repair kit", description: "Handy for rides and maintenance." },
      { title: "Cycling jersey or gloves", description: "Gear upgrade for their regular rides." },
    ],
  },
  {
    keywords: ["journal", "journaling", "writing", "write"],
    ideas: [
      { title: "Leather-bound journal", description: "For daily reflections or creative writing." },
      { title: "Nice fountain pen", description: "Makes the everyday act of writing feel special." },
    ],
  },
  {
    keywords: ["candle", "candles", "skincare", "spa", "self-care"],
    ideas: [
      { title: "Hand-poured candle set", description: "A cozy, calming scent for their space." },
      { title: "Spa gift set", description: "Skincare essentials for a relaxing night in." },
    ],
  },
  {
    keywords: ["fashion", "jewelry", "style", "clothes", "accessories"],
    ideas: [
      { title: "Statement jewelry piece", description: "Something that matches their personal style." },
      { title: "Gift card to their favorite clothing store", description: "Lets them pick exactly what they want." },
    ],
  },
  {
    keywords: ["chocolate", "sweets", "dessert", "baking", "candy"],
    ideas: [
      { title: "Artisan chocolate box", description: "A sweet treat from a local chocolatier." },
      { title: "Dessert-of-the-month subscription", description: "A recurring sweet surprise." },
    ],
  },
  {
    keywords: ["home", "decor", "decorating", "interior"],
    ideas: [
      { title: "Throw pillow or blanket in their favorite color", description: "A small refresh for their space." },
      { title: "Framed art print", description: "Something that fits their existing decor style." },
    ],
  },
];

const FALLBACK_IDEAS: GiftSuggestion[] = [
  { title: "Experience day of their choice", description: "A flexible gift card for an activity they'll enjoy." },
  { title: "Personalized keepsake", description: "Engraved or monogrammed with their name or initials." },
  { title: "Cozy blanket", description: "A thoughtful, always-useful gift." },
  { title: "Favorite restaurant gift card", description: "A meal out somewhere they love." },
  { title: "Subscription box matched to their interests", description: "A recurring surprise tailored to what they enjoy." },
];

export function generateGiftIdeas(input: {
  subjectFavorites: string;
  subjectActivities: string;
  authorNoteFavorites: string;
  authorNoteActivities: string;
  existingIdeaTitles: string[];
  max?: number;
}): GiftSuggestion[] {
  const corpus = [
    input.subjectFavorites,
    input.subjectActivities,
    input.authorNoteFavorites,
    input.authorNoteActivities,
  ]
    .join(" ")
    .toLowerCase();

  const excluded = new Set(input.existingIdeaTitles.map((t) => t.trim().toLowerCase()));
  const matched: GiftSuggestion[] = [];

  for (const entry of CATALOG) {
    if (entry.keywords.some((kw) => corpus.includes(kw))) {
      for (const idea of entry.ideas) {
        if (!excluded.has(idea.title.toLowerCase())) matched.push(idea);
      }
    }
  }

  const max = input.max ?? 8;
  const deduped: GiftSuggestion[] = [];
  const seenTitles = new Set<string>();
  for (const idea of matched) {
    const key = idea.title.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    deduped.push(idea);
  }

  if (deduped.length < max) {
    for (const idea of FALLBACK_IDEAS) {
      const key = idea.title.toLowerCase();
      if (seenTitles.has(key) || excluded.has(key)) continue;
      seenTitles.add(key);
      deduped.push(idea);
      if (deduped.length >= max) break;
    }
  }

  return deduped.slice(0, max);
}
