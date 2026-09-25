# AMS Realty Baza Starter

## Project router

- Контур: Windows 11, SourceCraft primary.
- Platform: AMS Realty Platform Core Standard 5.5, `AMS_PROFILE=REALTY_BASE`, режим `BUILD`.
- Delivery: `COMMERCIAL`.
- Secrets source of truth: Secret Master, self-hosted Infisical `https://infisical.ams24.ru`; Doppler is legacy/import source only until old secrets are migrated.
- Backend/data owner: Payload CMS + PostgreSQL; Prisma и второй backend/auth запрещены.
- Последняя исполненная программа Plan №8 v6 сохранена как evidence:
  `docs/plan8/S8_25_FINAL_EXECUTION_REPORT.md`. Принятый implementation SHA —
  `bd570ee40db9e25f73a24013be836dd3876282ac`; docs-only reconciliation слит в
  SourceCraft `main@c5803cfbac5d2c1817451fdee6aa96e3b975934e`.
- Единственная текущая planning basis —
  `docs/AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md`, Plan №9 v4
  `APPROVED`. Execution разрешён только через reconciled Task Manager graph;
  production и S15 остаются owner/release gate. `.beads` не коммитится.

- `start-baza.ams24.ru` — owner-operated demo/template verification contour on AMS Server. Runtime: local PostgreSQL + persistent `MEDIA_DIR`. S3 и Timeweb Managed PostgreSQL не являются starter runtime; клиентский clone принимает собственное topology decision (`docs/CLONE_ONBOARDING.md`).

## Reading order

1. `docs/README.md`.
2. Релевантный раздел `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`.
3. `docs/01_PRD.md`, `02_PRODUCT_STRUCTURE.md`, `03_ARCHITECTURE.md` и
   `04_BACKLOG.md` по scope.
4. `docs/PROJECT.md` — решения этого starter instance.
5. `docs/DESIGN.md` или `docs/OPERATIONS.md` по scope.
6. `docs/AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md` — только для
   approved/approval-bound scope Plan №9.
7. Профильный ADR/module/research документ, только когда он входит в scope.
8. `docs/plan8/`, `docs/proofs/` и `docs/legacy/` — только для evidence.

## Invariants

- Один независимый stream = одна branch/worktree = один Pull Request.
- Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`. Ветки, PR, exact-head Gate, merge и будущий freeze tag принадлежат SourceCraft; GitHub получает только односторонний fast-forward mirror canonical SourceCraft `main`. Reverse/bidirectional sync запрещён.
- Планы №6–8 исполнены и не являются очередью работ. Существующий tag
  `starter-freeze` остаётся историческим. Целевой tag `starter-v2.1.0` может
  создаваться только после исполнения и финальной приёмки Plan №9 и по
  отдельной явной release-команде владельца; production также требует
  отдельной команды.
- Независимый reviewer / Task Manager Code Reviewer запускается только по явному триггеру владельца (`проведи review`, `аудит кода`, `позови ревьюера`) или для отдельно зафиксированного high-risk/high-complexity scope. Создание Pull Request и обычная READY-задача не запускают независимый review автоматически.
- Автономность не отменяет COMMERCIAL Gate и fail-closed stop при красных проверках или изменившемся SHA.
- Production выполняется только по отдельной явной команде владельца.
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
