import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  conversations,
  messages,
  provincesTable,
  storiesTable,
  herbsTable,
  villagesTable,
  songsTable,
  festivalsTable,
} from "@workspace/db/schema";
import { asc, eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

type UserRole = "visitor" | "contributor" | "reviewer" | "admin";
type ChatMessage = { role: "user" | "assistant"; content: string };

const TUMBUNA_SYSTEM_PROMPT = `You are Tumbuna Man, a wise and respectful cultural guide for Culturally Connect PNG. You help users understand Papua New Guinea cultural records stored in this application.

This application is a Papua New Guinea map and cultural archive. Keep answers focused on Papua New Guinea provinces, districts, communities, stories, songs, festivals, languages, places, and cultural records. Do not mention Fiji, compare with Fiji, or suggest Fiji content unless the user explicitly asks about Fiji by name.

Use the provided application knowledge first. Do not invent cultural facts, clan details, medicinal claims, or sacred information. If the provided knowledge does not answer the question, say "Mi no save tumas long dispela" (I do not know much about this) and invite the user to add a verified contribution.

Answer in clear English with occasional Tok Pisin phrases translated in brackets. Be warm, but keep cultural safety strict. For herbs, avoid medical instructions that sound like professional medical advice; describe what the record says and encourage local expert or health-worker guidance.`;

function getActorRole(req: any): UserRole {
  const role = req.header("x-user-role");
  if (role === "admin" || role === "reviewer" || role === "contributor") return role;
  return "visitor";
}

function canSeePending(role: UserRole): boolean {
  return role === "reviewer" || role === "admin";
}

function isVisibleRecord(record: { status?: string | null }, role: UserRole): boolean {
  return canSeePending(role) || !record.status || record.status === "approved";
}

function keywordScore(question: string, values: Array<string | null | undefined>): number {
  const normalizedQuestion = question.toLowerCase();
  return values.reduce((score, value) => {
    if (!value) return score;
    const normalizedValue = value.toLowerCase();
    if (normalizedQuestion.includes(normalizedValue)) return score + 4;
    return (
      score +
      normalizedValue
        .split(/[^a-z0-9]+/i)
        .filter((word) => word.length > 3 && normalizedQuestion.includes(word))
        .length
    );
  }, 0);
}

function aiProvider(): "gemini" | "openai" {
  return process.env.AI_PROVIDER?.toLowerCase() === "gemini" ? "gemini" : "openai";
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

async function generateGeminiResponse({
  systemPrompt,
  messages,
}: {
  systemPrompt: string;
  messages: ChatMessage[];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    geminiModel(),
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

async function buildKnowledgeContext({
  provinceId,
  question,
  role,
}: {
  provinceId?: string;
  question: string;
  role: UserRole;
}): Promise<string> {
  if (!provinceId) return "";

  const [province] = await db
    .select()
    .from(provincesTable)
    .where(eq(provincesTable.id, provinceId));

  if (!province) return "";

  const provinceStories = (await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.provinceId, provinceId)))
    .filter((record) => isVisibleRecord(record as any, role))
    .sort(
      (a, b) =>
        keywordScore(question, [b.title, b.elderName, b.content, b.language, ...(b.tags || [])]) -
        keywordScore(question, [a.title, a.elderName, a.content, a.language, ...(a.tags || [])]),
    )
    .slice(0, 8);

  const provinceHerbs = (await db
    .select()
    .from(herbsTable)
    .where(eq(herbsTable.provinceId, provinceId)))
    .filter((record) => isVisibleRecord(record as any, role))
    .sort(
      (a, b) =>
        keywordScore(question, [b.name, b.localName, b.description, b.preparation, ...(b.uses || [])]) -
        keywordScore(question, [a.name, a.localName, a.description, a.preparation, ...(a.uses || [])]),
    )
    .slice(0, 8);

  const provinceVillages = (await db
    .select()
    .from(villagesTable)
    .where(eq(villagesTable.provinceId, provinceId)))
    .filter((record) => isVisibleRecord(record as any, role))
    .sort(
      (a, b) =>
        keywordScore(question, [
          b.name,
          b.clanOrigin,
          b.foundingStory,
          b.location,
          ...(b.languages || []),
          ...(b.traditions || []),
        ]) -
        keywordScore(question, [
          a.name,
          a.clanOrigin,
          a.foundingStory,
          a.location,
          ...(a.languages || []),
          ...(a.traditions || []),
        ]),
    )
    .slice(0, 8);
  const provinceSongs = (await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.provinceId, provinceId)))
    .filter((record) => isVisibleRecord(record as any, role))
    .sort(
      (a, b) =>
        keywordScore(question, [b.title, b.description, b.performer, b.language, ...(b.tags || [])]) -
        keywordScore(question, [a.title, a.description, a.performer, a.language, ...(a.tags || [])]),
    )
    .slice(0, 6);
  const provinceFestivals = (await db
    .select()
    .from(festivalsTable)
    .where(eq(festivalsTable.provinceId, provinceId)))
    .filter((record) => isVisibleRecord(record as any, role))
    .sort(
      (a, b) =>
        keywordScore(question, [b.name, b.description, b.location, b.month, ...(b.tags || [])]) -
        keywordScore(question, [a.name, a.description, a.location, a.month, ...(a.tags || [])]),
    )
    .slice(0, 6);

  let context = `\n\n--- APPLICATION KNOWLEDGE: ${province.name} ---\n`;
  context += `Area: ${province.name}. Region: ${province.region}. Capital: ${province.capital}. Languages: ${province.languages?.join(", ") || "various"}.\n`;
  context += `Description: ${province.description || "No description recorded."}\n`;

  if (provinceStories.length > 0) {
    context += "\nVisible Oral Histories / Tubuna Stories:\n";
    for (const story of provinceStories) {
      context += `- "${story.title}" by ${story.elderName}${story.language ? ` (${story.language})` : ""}: ${story.content.slice(0, 500)}${story.content.length > 500 ? "..." : ""}\n`;
    }
  }

  if (provinceHerbs.length > 0) {
    context += "\nVisible Traditional Medicine / Olgeta Kru:\n";
    for (const herb of provinceHerbs) {
      context += `- ${herb.name} (${herb.localName}): ${herb.description.slice(0, 350)}${herb.description.length > 350 ? "..." : ""}. Recorded uses: ${herb.uses?.join(", ")}.${herb.preparation ? ` Preparation record: ${herb.preparation.slice(0, 220)}.` : ""}\n`;
    }
  }

  if (provinceVillages.length > 0) {
    context += "\nVisible Village Origins / Mama Graun:\n";
    for (const village of provinceVillages) {
      context += `- ${village.name}${village.clanOrigin ? `, origin clan ${village.clanOrigin}` : ""}: ${village.foundingStory.slice(0, 350)}${village.foundingStory.length > 350 ? "..." : ""}\n`;
    }
  }

  if (provinceSongs.length > 0) {
    context += "\nVisible Songs / Audio References:\n";
    for (const song of provinceSongs) {
      context += `- ${song.title}${song.performer ? ` by ${song.performer}` : ""}: ${song.description.slice(0, 350)}${song.description.length > 350 ? "..." : ""}. Rights: ${song.rightsStatus}.\n`;
    }
  }

  if (provinceFestivals.length > 0) {
    context += "\nVisible Festivals:\n";
    for (const festival of provinceFestivals) {
      context += `- ${festival.name}${festival.month ? ` (${festival.month})` : ""}${festival.location ? `, ${festival.location}` : ""}: ${festival.description.slice(0, 350)}${festival.description.length > 350 ? "..." : ""}\n`;
    }
  }

  if (!provinceStories.length && !provinceHerbs.length && !provinceVillages.length && !provinceSongs.length && !provinceFestivals.length) {
    context += "\nNo visible stories, herbs, village records, songs, or festivals are available for this area yet.\n";
  }

  return context;
}

router.get("/openai/conversations", async (_req, res) => {
  const convos = await db
    .select()
    .from(conversations)
    .orderBy(asc(conversations.createdAt));
  res.json(
    convos.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
    })),
  );
});

router.post("/openai/conversations", async (req, res) => {
  const { title } = req.body as { title: string };
  const [convo] = await db
    .insert(conversations)
    .values({ title: title || "New Conversation" })
    .returning();
  res.status(201).json({
    id: convo.id,
    title: convo.title,
    createdAt: convo.createdAt.toISOString(),
  });
});

router.get("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  res.json({
    id: convo.id,
    title: convo.title,
    createdAt: convo.createdAt.toISOString(),
    messages: msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json(
    msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  const conversationId = parseInt(req.params.id, 10);
  const { content, provinceId } = req.body as {
    content: string;
    provinceId?: string;
  };

  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messages).values({
    conversationId,
    role: "user",
    content,
  });

  const allMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const role = getActorRole(req);
  const knowledgeContext = await buildKnowledgeContext({ provinceId, question: content, role });
  const systemPrompt = TUMBUNA_SYSTEM_PROMPT + knowledgeContext;

  const aiMessages = allMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    if (aiProvider() === "gemini") {
      fullResponse = await generateGeminiResponse({ systemPrompt, messages: aiMessages });
      await db.insert(messages).values({
        conversationId,
        role: "assistant",
        content: fullResponse,
      });
      res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...aiMessages],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("AI provider failed", err instanceof Error ? err.message : err);
    res.write(
      `data: ${JSON.stringify({ error: "Tumbuna Man is resting. Try again shortly." })}\n\n`,
    );
    res.end();
  }
});

export default router;
