# AMS Realty Baza Starter

## Project router

- Контур: Windows 11, SourceCraft primary.
- Platform: AMS Realty Platform Core Standard 5.5, `AMS_PROFILE=REALTY_BASE`, режим `BUILD`.
- Delivery: `COMMERCIAL`.
- Secrets source of truth: Secret Master, self-hosted Infisical `https://infisical.ams24.ru`; Doppler is legacy/import source only until old secrets are migrated.
- Backend/data owner: Payload CMS + PostgreSQL; Prisma и второй backend/auth запрещены.
- Последний закрытый master plan: `docs/AMS_MASTER_PLAN №5.md` (`Plan ID: AMS-REALTBASE-RESIDUAL-ALIGN`, `Version: v1`, `Status: APPROVED`, доставлен полностью). Ранее закрыты Core Align: `docs/AMS_MASTER_PLAN №4.md`, corrections: `docs/AMS_MASTER_PLAN №3.md` и hardening: `docs/AMS_MASTER_PLAN №2.md`. Исторический v1.0: `AMS_PROJECT_ARCHITECTURE_v1.0.md`.
- Operational graph: локальный stealth Beads после approved import; `.beads` не коммитится.

- `start-baza.ams24.ru` — owner-operated demo/template verification contour on AMS Server. Runtime: local PostgreSQL + persistent `MEDIA_DIR`. S3 и Timeweb Managed PostgreSQL не являются starter runtime; клиентский clone принимает собственное topology decision (`docs/CLONE_ONBOARDING.md`).

## Reading order

1. `docs/README.md`.
2. Профильный канонический документ из карты.
3. `docs/04_BACKLOG.md` — текущий статус и следующий разрешённый scope.
4. Релевантный раздел закрытого `docs/AMS_MASTER_PLAN №5.md` только для исторического acceptance/evidence.
5. `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` только в пределах текущего scope.

## Invariants

- Один независимый stream = одна branch/worktree = один Pull Request.
- Активная оркестрация APPROVED плана `AMS-REALTBASE-RESIDUAL-ALIGN` закрывает весь reconciled graph: WORK → commit/push → SourceCraft PR → MERGE_AFTER_GATE в `main` → удалить epic-ветку → следующая READY task. GitHub не трогать. Production в этот план не входит. Независимый Task Manager Code Reviewer только по явному триггеру владельца.
- Независимый reviewer / Task Manager Code Reviewer запускается только по явному триггеру владельца (`проведи review`, `аудит кода`, `позови ревьюера`) или для отдельно зафиксированного high-risk/high-complexity scope. Создание Pull Request и обычная READY-задача не запускают независимый review автоматически.
- Автономность не отменяет COMMERCIAL Gate и fail-closed stop при красных проверках или изменившемся SHA.
- Production выполняется только по отдельной явной команде владельца.
- Новые пароли, API tokens, SSH keys, database credentials и service credentials хранятся только в Secret Master. Для доступа к секретам использовать trigger `подключись к секрет мастеру`; для Git-доступов SourceCraft/GitHub — trigger `подключись к гид-сервису`. Значения секретов не печатать в чат, markdown, логи или git.
- До contract freeze UI работает через presentation contracts и fixture provider.
- Payload не диктует форму UI; public data проходит через Gateway и DTO.
- Новая инфраструктура или модуль добавляются только по доказанному trigger.
- Не заменять неизвестное решение догадкой: фиксировать `TODO` или `NEEDS_OWNER` в профильном документе.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
