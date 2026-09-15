# AMS Realty Baza Starter

## Project router

- Контур: Windows 11, SourceCraft primary.
- Platform: AMS Realty Platform Core Standard 5.5, `AMS_PROFILE=REALTY_BASE`, режим `BUILD`.
- Delivery: `COMMERCIAL`.
- Backend/data owner: Payload CMS + PostgreSQL; Prisma и второй backend/auth запрещены.
- Master plan: `AMS_PROJECT_ARCHITECTURE_v1.0.md`.
- Operational graph: локальный stealth Beads; `.beads` не коммитится.

## Reading order

1. `docs/README.md`.
2. Профильный канонический документ из карты.
3. Релевантный раздел `AMS_PROJECT_ARCHITECTURE_v1.0.md`.
4. `docs/04_BACKLOG.md` и текущая задача Beads.
5. `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` только в пределах текущего scope.

## Invariants

- Один независимый stream = одна branch/worktree = один Pull Request.
- В активной оркестрации мастер-плана команды владельца `продолжай`, `продолжай дальше` и эквивалентные заранее разрешают полный автономный цикл: WORK → review → exact-head Gate → merge в `main` → следующая READY task. Повторное подтверждение перед каждым merge не требуется.
- Автономность не отменяет независимый review, COMMERCIAL Gate и fail-closed stop при красных проверках или изменившемся SHA.
- Production выполняется только по отдельной явной команде владельца.
- До contract freeze UI работает через presentation contracts и fixture provider.
- Payload не диктует форму UI; public data проходит через Gateway и DTO.
- Новая инфраструктура или модуль добавляются только по доказанному trigger.
- Не заменять неизвестное решение догадкой: фиксировать `TODO` или `NEEDS_OWNER` в профильном документе.
