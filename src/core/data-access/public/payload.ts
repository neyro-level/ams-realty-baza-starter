import "server-only";

import configPromise from "@payload-config";
import { getPayload } from "payload";

export async function getPublicGatewayPayload() {
	return getPayload({ config: configPromise });
}
