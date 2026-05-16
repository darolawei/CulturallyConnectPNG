import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod/v4";
import { db, pool } from "./index";
import { festivalsTable, herbsTable, songsTable, storiesTable, villagesTable } from "./schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rightsStatusSchema = z.enum(["public_domain", "open_license", "permission_required", "community_owned", "unknown"]);
const sensitivitySchema = z.enum(["public", "community_review", "restricted", "sacred"]);
const statusSchema = z.enum(["draft", "pending", "approved", "rejected"]);

const sourceSchema = z.object({
  sourceTitle: z.string(),
  sourceUrl: z.string().url(),
  sourceAuthor: z.string().optional(),
  license: z.string().optional(),
  rightsStatus: rightsStatusSchema.default("unknown"),
  culturalSensitivity: sensitivitySchema.default("community_review"),
});

const baseRecordSchema = z.object({
  id: z.string(),
  provinceId: z.string(),
  tags: z.array(z.string()).optional(),
  status: statusSchema.default("pending"),
  importBatchId: z.string(),
  source: sourceSchema,
});

const importSchema = z.object({
  batchId: z.string(),
  stories: z.array(
    baseRecordSchema.extend({
      title: z.string(),
      content: z.string(),
      elderName: z.string().default("Public source"),
      language: z.string().optional(),
      audioUrl: z.string().url().optional(),
    }),
  ).default([]),
  herbs: z.array(
    baseRecordSchema.extend({
      name: z.string(),
      localName: z.string(),
      description: z.string(),
      uses: z.array(z.string()),
      preparation: z.string().optional(),
      warnings: z.string().optional(),
      imageUrl: z.string().url().optional(),
    }),
  ).default([]),
  villages: z.array(
    baseRecordSchema.extend({
      name: z.string(),
      clanOrigin: z.string(),
      foundingStory: z.string(),
      location: z.string().optional(),
      population: z.number().int().optional(),
      languages: z.array(z.string()).optional(),
      traditions: z.array(z.string()).optional(),
    }),
  ).default([]),
  songs: z.array(
    baseRecordSchema.extend({
      title: z.string(),
      description: z.string(),
      performer: z.string().optional(),
      language: z.string().optional(),
      audioUrl: z.string().url().optional(),
      lyrics: z.string().optional(),
    }),
  ).default([]),
  festivals: z.array(
    baseRecordSchema.extend({
      name: z.string(),
      month: z.string().optional(),
      description: z.string(),
      location: z.string().optional(),
    }),
  ).default([]),
});

function flattenSource(record: z.infer<typeof baseRecordSchema>) {
  return {
    sourceTitle: record.source.sourceTitle,
    sourceUrl: record.source.sourceUrl,
    sourceAuthor: record.source.sourceAuthor,
    license: record.source.license,
    rightsStatus: record.source.rightsStatus,
    culturalSensitivity: record.source.culturalSensitivity,
    importBatchId: record.importBatchId,
    status: record.status,
  };
}

const importPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, "../../cultural-import/starter-records.json");

const parsed = importSchema.parse(JSON.parse(fs.readFileSync(importPath, "utf8")));

try {
  for (const story of parsed.stories) {
    await db.insert(storiesTable).values({
      id: story.id,
      provinceId: story.provinceId,
      title: story.title,
      content: story.content,
      elderName: story.elderName,
      audioUrl: story.audioUrl,
      language: story.language,
      tags: story.tags,
      ...flattenSource(story),
    }).onConflictDoUpdate({
      target: storiesTable.id,
      set: {
        title: story.title,
        content: story.content,
        elderName: story.elderName,
        audioUrl: story.audioUrl,
        language: story.language,
        tags: story.tags,
        ...flattenSource(story),
        updatedAt: new Date(),
      },
    });
  }

  for (const herb of parsed.herbs) {
    await db.insert(herbsTable).values({
      id: herb.id,
      provinceId: herb.provinceId,
      name: herb.name,
      localName: herb.localName,
      description: herb.description,
      uses: herb.uses,
      preparation: herb.preparation,
      warnings: herb.warnings,
      imageUrl: herb.imageUrl,
      ...flattenSource(herb),
    }).onConflictDoUpdate({
      target: herbsTable.id,
      set: {
        name: herb.name,
        localName: herb.localName,
        description: herb.description,
        uses: herb.uses,
        preparation: herb.preparation,
        warnings: herb.warnings,
        imageUrl: herb.imageUrl,
        ...flattenSource(herb),
        updatedAt: new Date(),
      },
    });
  }

  for (const village of parsed.villages) {
    await db.insert(villagesTable).values({
      id: village.id,
      provinceId: village.provinceId,
      name: village.name,
      clanOrigin: village.clanOrigin,
      foundingStory: village.foundingStory,
      location: village.location,
      population: village.population,
      languages: village.languages,
      traditions: village.traditions,
      ...flattenSource(village),
    }).onConflictDoUpdate({
      target: villagesTable.id,
      set: {
        name: village.name,
        clanOrigin: village.clanOrigin,
        foundingStory: village.foundingStory,
        location: village.location,
        population: village.population,
        languages: village.languages,
        traditions: village.traditions,
        ...flattenSource(village),
        updatedAt: new Date(),
      },
    });
  }

  for (const song of parsed.songs) {
    await db.insert(songsTable).values({
      id: song.id,
      provinceId: song.provinceId,
      title: song.title,
      description: song.description,
      performer: song.performer,
      language: song.language,
      audioUrl: song.audioUrl,
      lyrics: song.lyrics,
      tags: song.tags,
      ...flattenSource(song),
    }).onConflictDoUpdate({
      target: songsTable.id,
      set: {
        title: song.title,
        description: song.description,
        performer: song.performer,
        language: song.language,
        audioUrl: song.audioUrl,
        lyrics: song.lyrics,
        tags: song.tags,
        ...flattenSource(song),
        updatedAt: new Date(),
      },
    });
  }

  for (const festival of parsed.festivals) {
    await db.insert(festivalsTable).values({
      id: festival.id,
      provinceId: festival.provinceId,
      name: festival.name,
      month: festival.month,
      description: festival.description,
      location: festival.location,
      tags: festival.tags,
      ...flattenSource(festival),
    }).onConflictDoUpdate({
      target: festivalsTable.id,
      set: {
        name: festival.name,
        month: festival.month,
        description: festival.description,
        location: festival.location,
        tags: festival.tags,
        ...flattenSource(festival),
        updatedAt: new Date(),
      },
    });
  }

  console.log(
    `Imported batch ${parsed.batchId}: ${parsed.stories.length} stories, ${parsed.herbs.length} herbs, ${parsed.villages.length} villages, ${parsed.songs.length} songs, ${parsed.festivals.length} festivals.`,
  );
} finally {
  await pool.end();
}
