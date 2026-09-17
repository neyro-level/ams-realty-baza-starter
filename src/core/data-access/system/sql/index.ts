/**
 * Approved parameterized SQL for system atomic/bulk operations.
 * Generic query(sql: string) is not exported. Callers pass schema-validated values only.
 */
export const systemSqlLayer = "src/core/data-access/system/sql" as const;
