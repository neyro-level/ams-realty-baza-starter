# Payload S3 activation patch

Apply this as a reviewed client-clone change, not to the starter.

1. Verify the clone still uses Payload `3.89.0`, then install
   `@payloadcms/storage-s3@3.89.0`. Recheck official compatibility if Payload has
   changed; do not mix package lines.
2. Move the example factory under `src/project/` and validate S3 env in the
   project's single env owner.
3. Add `timewebS3Plugin` to the Payload `plugins` array for `media`.
4. Remove the client production dependency on `staticDir`/`MEDIA_DIR` while
   keeping external feed image URLs unchanged.
5. Keep `PAYLOAD_DB_PUSH=false`; create and review migrations for any collection
   change.
6. Decide public/private URL, ACL and signed-download behavior explicitly from
   the client requirement and provider evidence. The blueprint does not guess.
7. Prove an Admin upload, read/access behavior, delete and rollback in staging.

The Payload adapter automatically disables local storage for configured
collections while enabled. Do not implement permanent local/S3 dual mode in the
starter.
