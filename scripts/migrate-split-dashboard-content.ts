/**
 * Copies documents from the legacy MongoDB collection `DashboardContent` into
 * `DashboardBlog`, `DashboardActivity`, `DashboardPhoto`, or `DashboardVideo`
 * using each document's `type` field. Preserves document ids (`_id`).
 *
 * Run after `prisma db push` (or deploy) so the new collections exist.
 *
 *   npx tsx scripts/migrate-split-dashboard-content.ts
 *   npx tsx scripts/migrate-split-dashboard-content.ts --dry-run
 *   npx tsx scripts/migrate-split-dashboard-content.ts --drop-legacy
 *
 * `--drop-legacy` drops `DashboardContent` only after a successful migrate (not with `--dry-run`).
 */
import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

type LegacyType = "blog" | "activity" | "photo" | "video";

function mongoId(doc: Record<string, unknown>): string {
  const raw = doc._id;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "$oid" in raw) {
    return String((raw as { $oid: string }).$oid);
  }
  return String(raw);
}

function asDate(v: unknown): Date {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (v && typeof v === "object" && v !== null && "$date" in v) {
    const inner = (v as { $date: string | number | { $numberLong: string } }).$date;
    if (typeof inner === "object" && inner !== null && "$numberLong" in inner) {
      return new Date(Number((inner as { $numberLong: string }).$numberLong));
    }
    return new Date(inner as string | number);
  }
  if (typeof v === "string" || typeof v === "number") return new Date(v);
  return new Date();
}

function buildCreateData(doc: Record<string, unknown>, id: string): Prisma.DashboardBlogCreateInput {
  return {
    id,
    title: String(doc.title ?? ""),
    category: String(doc.category ?? ""),
    description: doc.description != null ? String(doc.description) : null,
    coverImage: doc.coverImage != null ? String(doc.coverImage) : null,
    videoUrl: doc.videoUrl != null ? String(doc.videoUrl) : null,
    slug: doc.slug != null ? String(doc.slug) : null,
    localeContent: (doc.localeContent ?? undefined) as Prisma.InputJsonValue | undefined,
    createdById: doc.createdById != null ? String(doc.createdById) : null,
    status: doc.status != null ? String(doc.status) : null,
    publishedAt: doc.publishedAt != null ? asDate(doc.publishedAt) : null,
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

function firstBatchFromCommand(res: unknown): Record<string, unknown>[] {
  if (!res || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;
  const cursor = r.cursor;
  if (!cursor || typeof cursor !== "object") return [];
  const batch = (cursor as { firstBatch?: unknown }).firstBatch;
  return Array.isArray(batch) ? (batch as Record<string, unknown>[]) : [];
}

/** Read legacy docs via Mongo `find` or `aggregate` (Prisma/raw drivers may shape `cursor` differently). */
async function fetchLegacy(prisma: PrismaClient): Promise<Record<string, unknown>[]> {
  const viaFind = await prisma.$runCommandRaw({
    find: "DashboardContent",
    filter: {},
    limit: 10_000,
  });
  const batch = firstBatchFromCommand(viaFind);
  if (batch.length > 0) return batch;

  const viaAgg = await prisma.$runCommandRaw({
    aggregate: "DashboardContent",
    pipeline: [],
    cursor: { batchSize: 10_000 },
  });
  return firstBatchFromCommand(viaAgg);
}

async function main() {
  const prisma = new PrismaClient();
  const dryRun = process.argv.includes("--dry-run");
  const dropLegacy = process.argv.includes("--drop-legacy");

  try {
    const docs = await fetchLegacy(prisma);
    if (docs.length === 0) {
      console.info(
        "[migrate-split-dashboard-content] No documents found in collection `DashboardContent`.",
      );
      console.info(
        "  If you already ran this migration, data lives in DashboardBlog / DashboardActivity / DashboardPhoto / DashboardVideo.",
      );
      console.info(
        "  If this is a new database, create content from the dashboard — those collections start empty until you add items.",
      );
      console.info(
        "  If you expect old data, open MongoDB Compass and confirm `DashboardContent` still exists and has documents.",
      );
      return;
    }
    console.info(`[migrate-split-dashboard-content] Loaded ${docs.length} document(s) from DashboardContent.`);

    let migrated = 0;
    let skipped = 0;

    for (const doc of docs) {
      const t = doc.type;
      if (t !== "blog" && t !== "activity" && t !== "photo" && t !== "video") {
        console.warn("[migrate-split-dashboard-content] Skip unknown type:", t, mongoId(doc));
        skipped += 1;
        continue;
      }
      const type = t as LegacyType;
      const id = mongoId(doc);
      const data = buildCreateData(doc, id);

      if (dryRun) {
        console.info(`[dry-run] ${type} ${id} ${data.title}`);
        migrated += 1;
        continue;
      }

      const exists =
        type === "blog"
          ? await prisma.dashboardBlog.findUnique({ where: { id } })
          : type === "activity"
            ? await prisma.dashboardActivity.findUnique({ where: { id } })
            : type === "photo"
              ? await prisma.dashboardPhoto.findUnique({ where: { id } })
              : await prisma.dashboardVideo.findUnique({ where: { id } });
      if (exists) {
        skipped += 1;
        continue;
      }

      switch (type) {
        case "blog":
          await prisma.dashboardBlog.create({ data });
          break;
        case "activity":
          await prisma.dashboardActivity.create({ data });
          break;
        case "photo":
          await prisma.dashboardPhoto.create({ data });
          break;
        case "video":
          await prisma.dashboardVideo.create({ data });
          break;
      }
      migrated += 1;
    }

    console.info(
      `[migrate-split-dashboard-content] Done. migrated=${migrated} skipped=${skipped} dryRun=${dryRun}`,
    );

    if (dropLegacy && !dryRun) {
      try {
        await prisma.$runCommandRaw({ drop: "DashboardContent" });
        console.info("[migrate-split-dashboard-content] Dropped collection DashboardContent.");
      } catch (e) {
        console.warn(
          "[migrate-split-dashboard-content] Could not drop DashboardContent (it may already be removed).",
          e,
        );
      }
    } else if (dropLegacy && dryRun) {
      console.info("[migrate-split-dashboard-content] --drop-legacy ignored with --dry-run.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
