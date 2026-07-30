import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface RequestBody {
  name: string;
  interests: Record<string, string | string[] | undefined>;
  existingIdeas: string[];
}

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;

  const prompt = `You are a thoughtful gift-recommendation assistant for the app "Wrapped".
Suggest 6 specific, purchasable gift ideas for ${body.name} based on the profile below.
Do not repeat any idea already listed under "Existing ideas". Keep each idea to a short phrase
(max 8 words), no numbering, no explanation — one idea per line.

Profile:
${JSON.stringify(body.interests, null, 2)}

Existing ideas (do not repeat):
${body.existingIdeas.join(", ") || "none"}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const ideas = text
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);

  return NextResponse.json({ ideas });
}
