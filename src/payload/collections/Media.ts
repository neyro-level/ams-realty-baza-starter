import type { CollectionConfig } from "payload";
import {
	ensureMediaDirectory,
	uniqueMediaFilename,
} from "../../core/storage/local-fs.ts";
import { ownersOnly } from "../access/roles.ts";

const allowedMimeTypes = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"application/pdf",
];

export const Media: CollectionConfig = {
	slug: "media",
	upload: {
		staticDir: ensureMediaDirectory(),
		mimeTypes: allowedMimeTypes,
	},
	admin: {
		useAsTitle: "alt",
		defaultColumns: ["alt", "mimeType", "updatedAt"],
	},
	access: {
		create: ownersOnly,
		read: () => true,
		update: ownersOnly,
		delete: ownersOnly,
	},
	hooks: {
		beforeValidate: [
			({ data, originalDoc }) => {
				if (data?.filename && !originalDoc) {
					data.filename = uniqueMediaFilename(String(data.filename));
				}
				return data;
			},
		],
	},
	fields: [
		{
			name: "alt",
			type: "text",
			required: true,
		},
	],
};
