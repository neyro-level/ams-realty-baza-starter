# Client backup contract

## Managed PostgreSQL

- Enable the provider physical-backup schedule and record retention in the
  client operations document.
- Perform the documented provider restore flow against staging before
  production.
- Add a logical export only when client policy requires a portable SQL copy;
  Timeweb currently documents logical backups as beta, so it is not the sole
  recovery path.
- Record restore point, duration, integrity checks and application smoke result.

## S3 media

- Decide and record bucket versioning/lifecycle/retention in the client project.
- Prove recovery of a representative object and Payload media reference.
- Keep credentials in Secret Master and verify that backup access is independent
  enough for the chosen failure model.

No unowned `pg_dump_to_s3` placeholder is part of this blueprint.
