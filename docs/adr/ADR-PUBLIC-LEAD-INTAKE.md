# ADR-PUBLIC-LEAD-INTAKE

Статус: Accepted  
Дата: 2026-09-18  
Контекст: EPIC 5 / public lead intake + transactional outbox

## Решение

Публичная способность создать заявку:

```text
POST /api/public/leads
```

Generic Payload REST `leads.create` остаётся `adminsAndOwners` и deny-anonymous. Это не public create коллекции, а отдельный classified route.

Транзакционная запись lead + enabled `lead-deliveries` идёт через System Gateway `overrideAccess` в `createPayloadLeadOutboxRepository`. Анонимный Local API create без gateway запрещён.

Sweeper `recoverLeadDeliveries` — primary scheduler. Immediate `deliverLead` enqueue после commit — ускорение: ошибка enqueue не откатывает lead.

Idempotency: клиентский ключ или стабильный hash(`phoneE164`, `formKind`, `sourcePage`, `consentVersion`). Timestamp не является единственной основой.

Fraud fingerprint: keyed HMAC по `PAYLOAD_SECRET`, без raw IP/UA.

Канал включается только если он перечислен в `LEAD_CHANNELS`, заданы credential refs и непустой `LEAD_OUTBOUND_HOSTS`. Значения секретов не хранятся в Git.

## Почему

Конституция 5.5 требует public capability без открытия generic Payload CRUD. Outbox обязан быть transactional; доставка не должна зависеть от процесса, пережившего HTTP-ответ.
