import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  provincesTable,
  storiesTable,
  herbsTable,
  villagesTable,
  songsTable,
  festivalsTable,
  insertStorySchema,
  insertHerbSchema,
  insertVillageSchema,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();
type UserRole = "contributor" | "reviewer" | "admin";
type ActorContext = { userId: string | null; role: UserRole };

function getActor(req: any): ActorContext {
  const headerRole = req.header("x-user-role");
  const role: UserRole =
    headerRole === "admin" || headerRole === "reviewer" ? headerRole : "contributor";
  const userId = req.header("x-user-id") || null;
  return { role, userId };
}

function canModerate(role: UserRole): boolean {
  return role === "reviewer" || role === "admin";
}

function approvedFilterOrNull(status: string | null): boolean {
  return !status || status === "approved";
}

function requireReviewerOrAdmin(req: any, res: any): ActorContext | null {
  const actor = getActor(req);
  if (!canModerate(actor.role)) {
    res.status(403).json({ error: "Reviewer or admin role required" });
    return null;
  }
  return actor;
}

router.get("/provinces", async (req, res) => {
  const provinces = await db.select().from(provincesTable);
  res.json(provinces);
});

router.get("/provinces/:id", async (req, res) => {
  const [province] = await db
    .select()
    .from(provincesTable)
    .where(eq(provincesTable.id, req.params.id));
  if (!province) {
    res.status(404).json({ error: "Province not found" });
    return;
  }
  res.json(province);
});

router.get("/provinces/:id/summary", async (req, res) => {
  const actor = getActor(req);
  const [province] = await db
    .select()
    .from(provincesTable)
    .where(eq(provincesTable.id, req.params.id));
  if (!province) {
    res.status(404).json({ error: "Province not found" });
    return;
  }

  const allStories = await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.provinceId, req.params.id));
  const allHerbs = await db
    .select()
    .from(herbsTable)
    .where(eq(herbsTable.provinceId, req.params.id));
  const allVillages = await db
    .select()
    .from(villagesTable)
    .where(eq(villagesTable.provinceId, req.params.id));
  const allSongs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.provinceId, req.params.id));
  const allFestivals = await db
    .select()
    .from(festivalsTable)
    .where(eq(festivalsTable.provinceId, req.params.id));
  const stories = canModerate(actor.role) ? allStories : allStories.filter((row) => approvedFilterOrNull((row as any).status ?? null));
  const herbs = canModerate(actor.role) ? allHerbs : allHerbs.filter((row) => approvedFilterOrNull((row as any).status ?? null));
  const villages = canModerate(actor.role) ? allVillages : allVillages.filter((row) => approvedFilterOrNull((row as any).status ?? null));
  const songs = canModerate(actor.role) ? allSongs : allSongs.filter((row) => approvedFilterOrNull((row as any).status ?? null));
  const festivals = canModerate(actor.role) ? allFestivals : allFestivals.filter((row) => approvedFilterOrNull((row as any).status ?? null));

  const recentStories = stories
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )
    .slice(0, 3);

  res.json({
    provinceId: province.id,
    provinceName: province.name,
    storyCount: stories.length,
    herbCount: herbs.length,
    villageCount: villages.length,
    songCount: songs.length,
    festivalCount: festivals.length,
    pendingStoryCount: allStories.filter((row) => (row as any).status === "pending").length,
    pendingHerbCount: allHerbs.filter((row) => (row as any).status === "pending").length,
    pendingVillageCount: allVillages.filter((row) => (row as any).status === "pending").length,
    pendingSongCount: allSongs.filter((row) => (row as any).status === "pending").length,
    pendingFestivalCount: allFestivals.filter((row) => (row as any).status === "pending").length,
    recentStories,
  });
});

router.get("/stories", async (req, res) => {
  const actor = getActor(req);
  const { provinceId } = req.query;
  if (provinceId && typeof provinceId === "string") {
    const stories = await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.provinceId, provinceId));
    res.json(canModerate(actor.role) ? stories : stories.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  } else {
    const stories = await db.select().from(storiesTable);
    res.json(canModerate(actor.role) ? stories : stories.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  }
});

router.get("/stories/:id", async (req, res) => {
  const [story] = await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.id, req.params.id));
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(story);
});

router.post("/stories", async (req, res) => {
  const actor = getActor(req);
  const parsed = insertStorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [story] = await db
    .insert(storiesTable)
    .values({
      ...parsed.data,
      id: randomUUID(),
      status: actor.role === "admin" ? "approved" : "pending",
      createdBy: actor.userId,
      updatedBy: actor.userId,
      approvedBy: actor.role === "admin" ? actor.userId : null,
      approvedAt: actor.role === "admin" ? new Date() : null,
    })
    .returning();
  res.status(201).json(story);
});

router.get("/herbs", async (req, res) => {
  const actor = getActor(req);
  const { provinceId } = req.query;
  if (provinceId && typeof provinceId === "string") {
    const herbs = await db
      .select()
      .from(herbsTable)
      .where(eq(herbsTable.provinceId, provinceId));
    res.json(canModerate(actor.role) ? herbs : herbs.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  } else {
    const herbs = await db.select().from(herbsTable);
    res.json(canModerate(actor.role) ? herbs : herbs.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  }
});

router.post("/herbs", async (req, res) => {
  const actor = getActor(req);
  const parsed = insertHerbSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [herb] = await db
    .insert(herbsTable)
    .values({
      ...parsed.data,
      id: randomUUID(),
      status: actor.role === "admin" ? "approved" : "pending",
      createdBy: actor.userId,
      updatedBy: actor.userId,
      approvedBy: actor.role === "admin" ? actor.userId : null,
      approvedAt: actor.role === "admin" ? new Date() : null,
    })
    .returning();
  res.status(201).json(herb);
});

router.get("/villages", async (req, res) => {
  const actor = getActor(req);
  const { provinceId } = req.query;
  if (provinceId && typeof provinceId === "string") {
    const villages = await db
      .select()
      .from(villagesTable)
      .where(eq(villagesTable.provinceId, provinceId));
    res.json(canModerate(actor.role) ? villages : villages.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  } else {
    const villages = await db.select().from(villagesTable);
    res.json(canModerate(actor.role) ? villages : villages.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  }
});

router.post("/villages", async (req, res) => {
  const actor = getActor(req);
  const parsed = insertVillageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [village] = await db
    .insert(villagesTable)
    .values({
      ...parsed.data,
      id: randomUUID(),
      status: actor.role === "admin" ? "approved" : "pending",
      createdBy: actor.userId,
      updatedBy: actor.userId,
      approvedBy: actor.role === "admin" ? actor.userId : null,
      approvedAt: actor.role === "admin" ? new Date() : null,
    })
    .returning();
  res.status(201).json(village);
});

router.get("/songs", async (req, res) => {
  const actor = getActor(req);
  const { provinceId } = req.query;
  if (provinceId && typeof provinceId === "string") {
    const songs = await db
      .select()
      .from(songsTable)
      .where(eq(songsTable.provinceId, provinceId));
    res.json(canModerate(actor.role) ? songs : songs.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  } else {
    const songs = await db.select().from(songsTable);
    res.json(canModerate(actor.role) ? songs : songs.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  }
});

router.get("/festivals", async (req, res) => {
  const actor = getActor(req);
  const { provinceId } = req.query;
  if (provinceId && typeof provinceId === "string") {
    const festivals = await db
      .select()
      .from(festivalsTable)
      .where(eq(festivalsTable.provinceId, provinceId));
    res.json(canModerate(actor.role) ? festivals : festivals.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  } else {
    const festivals = await db.select().from(festivalsTable);
    res.json(canModerate(actor.role) ? festivals : festivals.filter((row) => approvedFilterOrNull((row as any).status ?? null)));
  }
});

router.patch("/stories/:id/status", async (req, res) => {
  const actor = requireReviewerOrAdmin(req, res);
  if (!actor) return;
  const status = req.body?.status;
  if (!["draft", "pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(storiesTable)
    .set({
      status,
      updatedBy: actor.userId,
      approvedBy: status === "approved" ? actor.userId : null,
      approvedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    } as any)
    .where(eq(storiesTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(updated);
});

router.patch("/herbs/:id/status", async (req, res) => {
  const actor = requireReviewerOrAdmin(req, res);
  if (!actor) return;
  const status = req.body?.status;
  if (!["draft", "pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(herbsTable)
    .set({
      status,
      updatedBy: actor.userId,
      approvedBy: status === "approved" ? actor.userId : null,
      approvedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    } as any)
    .where(eq(herbsTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Herb not found" });
    return;
  }
  res.json(updated);
});

router.patch("/villages/:id/status", async (req, res) => {
  const actor = requireReviewerOrAdmin(req, res);
  if (!actor) return;
  const status = req.body?.status;
  if (!["draft", "pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(villagesTable)
    .set({
      status,
      updatedBy: actor.userId,
      approvedBy: status === "approved" ? actor.userId : null,
      approvedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    } as any)
    .where(eq(villagesTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Village not found" });
    return;
  }
  res.json(updated);
});

router.patch("/songs/:id/status", async (req, res) => {
  const actor = requireReviewerOrAdmin(req, res);
  if (!actor) return;
  const status = req.body?.status;
  if (!["draft", "pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(songsTable)
    .set({
      status,
      updatedBy: actor.userId,
      approvedBy: status === "approved" ? actor.userId : null,
      approvedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    } as any)
    .where(eq(songsTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Song not found" });
    return;
  }
  res.json(updated);
});

router.patch("/festivals/:id/status", async (req, res) => {
  const actor = requireReviewerOrAdmin(req, res);
  if (!actor) return;
  const status = req.body?.status;
  if (!["draft", "pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(festivalsTable)
    .set({
      status,
      updatedBy: actor.userId,
      approvedBy: status === "approved" ? actor.userId : null,
      approvedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    } as any)
    .where(eq(festivalsTable.id, req.params.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Festival not found" });
    return;
  }
  res.json(updated);
});

export default router;
