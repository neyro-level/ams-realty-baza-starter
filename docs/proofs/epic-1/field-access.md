# EPIC 1 — field-level access

Checked: 2026-09-18

Private property fields use `privateFieldAccess` (`read/create/update` = owner/admin) in `src/payload/collections/Properties.ts`:

- `unitNumber`
- `cadastralNumber`
- `internalComment`
- `ownerContact`

Lead PII uses `piiFieldAccess` (owner/admin) in `src/payload/collections/Leads.ts`:

- `name`, `phoneRaw`, `phoneE164`, `email`, `message`

Collection read for properties still hides unpublished rows from non-admin. Editors without owner/admin do not receive private field values even if they can see a published document.

Schema completeness: required collections already exist; no migration in this task (`pnpm verify:schema` not required).

Proof command: `node scripts/verify-field-access.mjs`
