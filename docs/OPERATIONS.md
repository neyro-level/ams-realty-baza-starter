# Operations

Статус: `Skeleton / production not provisioned`.

Этот файл хранит только проектные runbooks. Архитектурные инварианты находятся в `03_ARCHITECTURE.md`, а release gates — в `05_RELEASE_CHECKLIST.md`.

## Deploy и rollback

`TODO: оформить после выбора exact Timeweb runtime и immutable artifact format.` Обязательные границы: отдельная команда владельца, clean SourceCraft `main`, exact SHA, отсутствие build на production host, один rollout и live smoke. Известный рабочий artifact сохраняется для rollback.

При handover jobs сначала новый runtime стартует с `JOBS_AUTORUN=false`; старый jobs owner выключается до controlled restart нового с `true`. Два jobs-active runtime недопустимы.

## Migrations

`schema change -> dev proof -> migration -> verify:schema -> staging when RISKY -> production`. Payload `push` в production запрещён.

## Backup и restore

`TODO: после provisioning.` Требуются automatic Managed PostgreSQL backup, S3 versioning/backup policy и фактическая restore rehearsal до первого production release.

## Import operations

- manual import, suspicious approval, stale/orphan recovery и retry описываются после реализации jobs/import foundation;
- оборванный, плохой или suspicious feed не деактивирует каталог;
- изменение source identity или parser mapping проходит staging;
- новый image host требует config review, rebuild и release.

## Lead operations

- retry/recovery, missing adapter, channel outage и CRM token recovery добавляются до подключения соответствующего канала;
- внешняя доставка не меняет успешный ответ после сохранения лида в собственной БД;
- PII и секреты не пишутся в обычные logs.

## Диагностика и инцидент

До release должны быть проверяемые health/alerts для site, DB, overdue feed, interrupted import, lead backlog/abandoned, backup failure и critical integration failure. Incident procedure: зафиксировать SHA и симптомы, остановить опасный mutating path, сохранить evidence, выполнить approved recovery/rollback и подтвердить live state.

## Payload Jobs, S3, CSP и raw REST

Конкретные команды диагностики добавляются вместе с реализацией. До этого любые процедуры имеют статус `TODO`, а не считаются рабочим runbook.
