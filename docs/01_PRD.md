# PRD — AMS Realty Baza Starter

Статус: `Active foundation + approved Plan 8 geo-catalog target`.

## Продукт

AMS Realty Baza Starter — коммерческая базовая платформа AMS для сайтов агентств недвижимости: публичный сайт и каталог, Payload Admin, безопасный импорт нескольких XML/YRL-фидов и надёжное сохранение и доставку лидов.

## Пользователи

- посетитель подбирает объект и отправляет заявку;
- агентство управляет объектами, страницами и лидами через Payload Admin;
- один владелец с AI разрабатывает, выпускает и обслуживает экземпляр.

## Базовый объём

- 15–50 страниц;
- обычно 300–1 000 объектов, до примерно 2 000 active inventory records;
- несколько feed sources;
- 1–2 администратора;
- формы заявок и подключаемые каналы доставки;
- отдельные Managed PostgreSQL, S3, домен и секреты на клиента.

## Ценность первой версии

Единый проверяемый foundation, который сохраняет визуальные паттерны Atlas, но не переносит его технический долг. UI зависит от presentation contracts, а Payload реализует эти contracts через Gateway и DTO.

## Approved Plan 8 extension

Plan №8 преобразует foundation в переносимую geo-first catalog platform:
single-geo и multi-geo профили, каноническая URL-грамматика, нормализованные
geo/taxonomy entities, developments/developers, Public Gateway/DTO, SEO Registry,
Content Gate и проверяемый route cutover. Target-контракт:
`platform/GEO_CATALOG_CONTRACT.md`.

Это утверждённый target, а не описание уже работающего runtime. До P8-23A
публичными остаются текущие маршруты из `02_PRODUCT_STRUCTURE.md`.

## Не входит без отдельного trigger

Личный кабинет, Redis, broker, PostGIS, поисковый движок, второй backend/ORM,
отдельный jobs runner и multi-currency. Bounded feed-image mirror и подготовка
модуля новостроек получили явный trigger только внутри Plan №8 и не считаются
реализованными до соответствующих epics.

Продуктовые границы определяет `02_PRODUCT_STRUCTURE.md`, технические —
`03_ARCHITECTURE.md`, текущую работу — `04_BACKLOG.md`.
