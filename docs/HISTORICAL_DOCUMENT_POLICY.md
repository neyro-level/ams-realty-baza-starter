# Historical document policy

Статус: `ACTIVE ROUTER`.

Только `AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md`
является текущим execution source. Статус `APPROVED` внутри старого документа
описывает его исторический snapshot и не делает его текущей очередью.

| Scope | Статус | Разрешённое использование |
|---|---|---|
| `AMS_MASTER_PLAN_11_CLONE_FACTORY_2_2.md` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Контракт и evidence завершённого Plan №11 |
| `AMS_MASTER_PLAN_10_CLONE_READY_2_1.md` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Контракт и evidence завершённого Plan №10 |
| `AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Контракт и evidence завершённого Plan №9 |
| `legacy/**` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Архив решений; не execution queue |
| `plan8/**` | `EVIDENCE ONLY` | Артефакты закрытых задач Plan №8 |
| `evidence/**` | `EVIDENCE ONLY` | Проверки и delivery records на указанных в них SHA |
| `proofs/**` | `EVIDENCE ONLY` | Точечные historical proofs; не текущий release proof |
| `orchestration/master-plan-{2..11}.inventory.json` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Старые graph snapshots; не импортировать повторно |

Запрещено брать READY-задачи, current SHA/tag, release authority или production
status из этих путей. Для очереди используется только reconciled Plan №12
Beads graph; для текущего release state — `STARTER_RELEASE_STATE.md`.

Исторические source-файлы и evidence не редактируются ради нового статуса:
их exact bytes, hashes и формулировки сохраняются. Новые факты записываются
отдельным post-merge/post-release evidence рядом с исходным документом.
