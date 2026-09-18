# Backlog

Статус: `Active / Execution` — `AMS-REALTBASE-CORRECTIONS` v3 APPROVED.

Требования и acceptance эпиков находятся в `AMS_MASTER_PLAN №3.md`. Этот файл хранит только верхнеуровневый фокус; атомарные задачи появятся в stealth Task Manager только после утверждения плана.

## Фокус

EPIC 11–21: public data boundary, убрать public raw SQL, честный starter topology (local PostgreSQL + MEDIA_DIR на AMS Server), retention, access, feeds, derived fields, security, UI drift, final proof, один demo release на `start-baza.ams24.ru`.

## Политика доставки

- EPIC 11–20: новая ветка от `main`, проверки по сложности, PR в `main`, `MERGE_AFTER_GATE`, удаление ветки.
- EPIC 21: один production rollout на AMS Server. Managed PostgreSQL/S3 не покупаем.
- Долгоживущая integration branch не используется.

## Исторический HARDENING v2

Закрыт на `main@f39826c` (EPIC 0–10). Не исполнять заново.

## Исторический v1.0

Master plan v1.0 заключён 2026-09-17. Тогдашние EPIC 17 и EPIC 18 сознательно не реализовывались. Номера EPIC 11–21 в текущем плане — новая программа, не те задачи.
