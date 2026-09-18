# EPIC 4 — sitemap sharding

Checked: 2026-09-18

- `generateSitemaps` in `src/app/sitemap.ts`; shard `id` accepted as `Promise<string>` (Next.js 16).
- Max 50_000 URLs per shard from `projectConfig.sitemapUrlsPerShard`.
- Bounded SQL pages of `sitemapQueryPageSize` (500), no Payload `limit: 1000`.
- CI/build without Postgres: `generateSitemaps` falls back to shard `0`; dynamic catalog URLs are omitted until the runtime has a database.
- Static indexable URLs + CMS pages + published properties are sliced across shards.
