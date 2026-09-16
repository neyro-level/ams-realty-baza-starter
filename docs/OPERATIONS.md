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

## Secrets и доступы

Secret Master, self-hosted Infisical `https://infisical.ams24.ru`, является canonical source of truth для секретов и доступов AMS RealBaza. Все новые пароли, API tokens, SSH keys, database credentials и service credentials создаются и хранятся там. Doppler считается только legacy/import source, если старые секреты ещё не перенесены.

Операционное правило: значения секретов не выводить в чат, markdown, логи или git. Для работы с секретами использовать trigger `подключись к секрет мастеру`. Для Git-доступов SourceCraft/GitHub использовать trigger `подключись к гид-сервису`. SourceCraft — основной Git-сервис; GitHub — зеркало, если проект явно не говорит обратное.

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
