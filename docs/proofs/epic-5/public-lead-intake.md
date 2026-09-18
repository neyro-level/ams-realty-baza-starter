# Proof: public lead intake + outbox

- Canonical endpoint: `POST /api/public/leads` in `config/raw-rest-boundary.json`.
- Generic Payload `leads` create remains `adminsAndOwners` / deny-anonymous.
- `commitLeadOutbox` creates lead + enabled delivery rows in one transaction.
- Duplicate submit with the same idempotency key reuses the same logical lead.
- Immediate enqueue failure does not roll back the lead; `recoverLeadDeliveries` remains the correctness path.
- Job input is `{ leadDeliveryId }` only; PII is not placed in job input.
- Enabled channels require credential refs and `LEAD_OUTBOUND_HOSTS`; empty `LEAD_CHANNELS` commits a lead with zero deliveries.
