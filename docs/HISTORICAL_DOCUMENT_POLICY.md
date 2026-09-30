# Historical document policy

Статус: `ACTIVE ROUTER`.

Активного execution source нет. Статус `APPROVED` внутри завершённого документа
описывает точный исторический snapshot и не делает его текущей очередью.

| Scope | Статус | Разрешённое использование |
|---|---|---|
| `AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md` | `EXECUTION_COMPLETE / EVIDENCE ONLY` | Exact approved contract Plan №12 v4; итог в `evidence/plan12/FINAL_REPORT.md` |
| `AMS_MASTER_PLAN_11_CLONE_FACTORY_2_2.md` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Контракт и evidence завершённого Plan №11 |
| `AMS_MASTER_PLAN_10_CLONE_READY_2_1.md` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Контракт и evidence завершённого Plan №10 |
| `AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Контракт и evidence завершённого Plan №9 |
| `legacy/**` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Архив решений; не execution queue |
| `plan8/**` | `EVIDENCE ONLY` | Артефакты закрытых задач Plan №8 |
| `evidence/**` | `EVIDENCE ONLY` | Проверки и delivery records на указанных в них SHA |
| `proofs/**` | `EVIDENCE ONLY` | Точечные historical proofs; не текущий release proof |
| `orchestration/master-plan-{9..12}.inventory.json` и `legacy/orchestration/**` | `HISTORICAL / SUPERSEDED / EVIDENCE ONLY` | Закрытые graph snapshots; не импортировать повторно |

Запрещено брать READY-задачи, current SHA/tag, release authority или production
status из этих путей. Новая очередь появляется только после отдельного approved
plan/import; для текущего release state используется `STARTER_RELEASE_STATE.md`.

Исторические source-файлы и evidence не редактируются ради нового статуса:
их exact bytes, hashes и формулировки сохраняются. Новые факты записываются
отдельным post-merge/post-release evidence рядом с исходным документом.
