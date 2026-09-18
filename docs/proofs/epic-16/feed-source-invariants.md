# EPIC-16 feed source invariants

- Enabled sources get `nextDueAt = now` on create/enable when missing (`normalizeEnabledFeedNextDueAt` + FeedSources `beforeChange`).
- Dispatcher claims enabled rows with `next_due_at IS NULL OR next_due_at <= now` so they are not dropped.
- After claim, next due is `GREATEST(now+interval, previous+interval)` — missed intervals do not catch up.
- Data backfill: migration `20260918_193000` sets `next_due_at = NOW()` for enabled null rows.
- Manual import queues the same `importFeed` job; safety knobs come from the source row, not a bypass.
