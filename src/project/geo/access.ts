import type { Access, PayloadRequest } from "payload";
import { hasRole } from "../../core/access/roles.ts";

export const geoValidationOperation = "geo-validation" as const;

export function geoValidationContext(req: Pick<PayloadRequest, "context">) {
	return {
		...(req.context ?? {}),
		geoOperation: geoValidationOperation,
	};
}

export const geoReadAccess: Access = ({ req }) =>
	hasRole(req.user, ["owner", "admin"]) ||
	(req.context as { geoOperation?: string } | undefined)?.geoOperation ===
		geoValidationOperation;
