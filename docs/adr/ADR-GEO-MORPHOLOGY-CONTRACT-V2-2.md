# ADR: Geo morphology presentation contract 2.2

Статус: `ACCEPTED`

Authority: `AMS-REALTY-BAZA-CLONE-READY-2-1-10`, v4, `APPROVED`, B1-T2.

## Контекст

Клиентский clone preset должен хранить точную морфологию городов и
районов. Замороженный base contract 2.1.0 допускал только `в` и `на`,
поэтому не мог без искажения передать формы вроде `во Владивостоке`.

## Решение

- повысить base contract с `2.1.0` до `2.2.0`;
- добавить `во` в `CityDTO.preposition` и `DistrictDTO.preposition`;
- сохранить `в` и `на`, поэтому изменение остаётся совместимым для
  текущих consumers;
- обновить frozen lock только вместе с этим ADR и approved Plan 10.

## Откат

Откат выполняется полным revert contract 2.2.0 вместе с зависящей от
`во` clone-морфологией; частичное расхождение DTO и lock запрещено.

## Проверка

- `pnpm contracts:check`;
- clone matrix и geo seed integration;
- typecheck и batch RISKY schema-data gate.
