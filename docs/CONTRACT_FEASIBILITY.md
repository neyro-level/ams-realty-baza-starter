# Contract Feasibility

Статус: `Draft / contracts not created`.

Этот документ отвечает только за реализуемость presentation contracts. Сами DTO и версии contracts принадлежат будущему `packages/contracts`.

## Gate до freeze v1

Для каждого DTO field должны быть заполнены:

| Field | Source | Computation | Query cost | Available in base schema | Decision |
|---|---|---|---|---|---|
| `TODO` | `TODO` | `TODO` | `TODO` | `TODO` | `NEEDS_OWNER` |

Contract нельзя замораживать, если у поля нет источника, стоимость запроса неясна или оно требует неутверждённой schema dependency.

## Уже зафиксированные ограничения

- UI получает DTO, а не raw Payload documents;
- `MediaDTO` storage-neutral: `external | managed`, `src`, `alt`, optional dimensions;
- деньги передаются в integer minor units; `pricePerMeterMinor` вычисляется в ingest;
- public contract не содержит PII, секреты или private operational fields;
- fixture provider и будущий Payload Gateway обязаны реализовать одинаковый публичный API;
- фильтры/facets не получают отдельную инфраструктуру без доказанного cost/capacity trigger.

## Следующий шаг

EPIC 2 создаёт DTO draft и заполняет таблицу по каждому полю. До этого статус feasibility — `NOT VERIFIED`, contract freeze запрещён.
