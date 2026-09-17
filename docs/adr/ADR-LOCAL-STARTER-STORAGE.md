# ADR-LOCAL-STARTER-STORAGE

Статус: Accepted  
Дата: 2026-09-18  
Контекст: AMS RealtBase Starter / `AMS_PROFILE=REALTY_BASE`

## Решение

Starter живёт на одном AMS Server:

- PostgreSQL local, не Timeweb Managed PostgreSQL;
- Payload Media в persistent host directory (`MEDIA_DIR`), не `@payloadcms/storage-s3`;
- один application runtime с `JOBS_AUTORUN=true`.

Это осознанное deviation от типовой commercial topology Core 5.5. Клиентский clone принимает собственное topology decision.

## Почему

Owner-operated template/demo не должен требовать отдельную платную managed-инфраструктуру. Нужны проверяемые backup/restore и jobs ownership на уже существующем сервере.

## Сохраняется

Storage Boundary abstraction. S3-compatible adapter может вернуться в клиентском clone заменой adapter/config, не переписыванием UI.

## Последствия

- Disk-full — critical condition; backup обязан иметь offsite/второй носитель.
- Production client rollout не копирует эту topology автоматически.
