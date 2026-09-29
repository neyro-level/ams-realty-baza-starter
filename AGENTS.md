# AMS Realty Baza Starter

## Project router

- Контур: Windows 11, SourceCraft primary.
- Platform: AMS Realty Platform Core Standard 5.5, `AMS_PROFILE=REALTY_BASE`, режим `BUILD`.
- Delivery: `COMMERCIAL`.
- Secrets source of truth: Secret Master, self-hosted Infisical `https://infisical.ams24.ru`; Doppler is legacy/import source only until old secrets are migrated.
- Backend/data owner: Payload CMS + PostgreSQL; Prisma и второй backend/auth запрещены.
- Текущий execution source — локальный approved Plan №12 v4
  `docs/AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md`.
  Его operational graph импортирован в stealth Beads и reconciled `CLEAN`:
  `10 epic + 89 task`, drift `0`, cycles `0`; `.beads` не коммитится.
- Plan №11 исполнен и читается только как `EXECUTION_COMPLETE / EVIDENCE`.
  Post-merge evidence: `docs/evidence/plan11/POST_MERGE_DELIVERY.md`.
- Текущее состояние release/tag/SHA/Gate хранится только в
  `docs/STARTER_RELEASE_STATE.md`; исторические планы не переопределяют его.
- Статусы старых plans/evidence определяет
  `docs/HISTORICAL_DOCUMENT_POLICY.md`; пути со статусом `HISTORICAL`,
  `SUPERSEDED` или `EVIDENCE ONLY` запрещено читать как execution queue.

- `start-baza.ams24.ru` — owner-operated demo/template verification contour on AMS Server. Runtime: local PostgreSQL + persistent `MEDIA_DIR`. S3 и Timeweb Managed PostgreSQL не являются starter runtime; клиентский clone принимает собственное topology decision (`docs/CLONE_ONBOARDING.md`).

## Reading order

1. `docs/README.md`.
2. Релевантный раздел `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`.
3. `docs/01_PRD.md`, `02_PRODUCT_STRUCTURE.md`, `03_ARCHITECTURE.md` и
   `04_BACKLOG.md` по scope.
4. `docs/PROJECT.md` — решения этого starter instance.
5. `docs/DESIGN.md` или `docs/OPERATIONS.md` по scope.
6. `docs/STARTER_RELEASE_STATE.md` — текущая release identity и proof state.
7. `docs/AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md`
   — текущий approved execution source Plan №12 v4.
8. `docs/HISTORICAL_DOCUMENT_POLICY.md` перед чтением старого plan/evidence.
9. Профильный ADR/module/research документ, только когда он входит в scope.

## Invariants

- Один независимый stream = одна branch/worktree = один Pull Request.
- Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`. Ветки, PR, exact-head Gate, merge и будущий freeze tag принадлежат SourceCraft; GitHub получает только односторонний fast-forward mirror canonical SourceCraft `main`. Reverse/bidirectional sync запрещён.
- Планы №6–11 исполнены и не являются очередью работ. `starter-freeze` —
  исторический tag; новый `starter-v2.MINOR.PATCH` выбирается и создаётся только
  отдельной release-командой после завершения Plan №12. Production и mirror
  также требуют отдельных явных команд.
- Независимый reviewer / Task Manager Code Reviewer запускается только по явному триггеру владельца (`проведи review`, `аудит кода`, `позови ревьюера`) или для отдельно зафиксированного high-risk/high-complexity scope. Создание Pull Request и обычная READY-задача не запускают независимый review автоматически.
- Автономность не отменяет COMMERCIAL Gate и fail-closed stop при красных проверках или изменившемся SHA.
- Production выполняется только по отдельной явной команде владельца.
- Client Master Plan создаётся только от immutable released starter tag и
  exact 40-character SourceCraft SHA этого tag; moving `main` не baseline.
- Новые пароли, API tokens, SSH keys, database credentials и service credentials хранятся только в Secret Master. Для доступа к секретам использовать trigger `подключись к секрет мастеру`; для Git-доступов SourceCraft/GitHub — trigger `подключись к гид-сервису`. Значения секретов не печатать в чат, markdown, логи или git.
- UI работает через замороженные presentation contracts и Public Gateway/fixture provider по режиму.
- Payload не диктует форму UI; public data проходит через Gateway и DTO.
- Новая инфраструктура или модуль добавляются только по доказанному trigger.
- Не заменять неизвестное решение догадкой: фиксировать `TODO` или `NEEDS_OWNER` в профильном документе.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
