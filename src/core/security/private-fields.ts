export const privatePropertyFields = [
	"unitNumber",
	"cadastralNumber",
	"ownerName",
	"ownerPhone",
	"internalNotes",
] as const;

export type PrivatePropertyField = (typeof privatePropertyFields)[number];
