import * as migration_20260916_062222 from "./20260916_062222";
import * as migration_20260916_084953 from "./20260916_084953";
import * as migration_20260916_090228 from "./20260916_090228";
import * as migration_20260916_091500 from "./20260916_091500";
import * as migration_20260918_101800 from "./20260918_101800";
import * as migration_20260918_193000 from "./20260918_193000";
import * as migration_20260919_120900 from "./20260919_120900";
import * as migration_20260919_140536_add_payload_jobs from "./20260919_140536_add_payload_jobs";
import * as migration_20260919_151000 from "./20260919_151000";
import * as migration_20260921_185354_add_reset_password_requested_at from "./20260921_185354_add_reset_password_requested_at";
import * as migration_20260924_111534 from "./20260924_111534";
import * as migration_20260924_134500_geo_hierarchy from "./20260924_134500_geo_hierarchy";
import * as migration_20260924_151000_property_geo_refs from "./20260924_151000_property_geo_refs";

export const migrations = [
	{
		up: migration_20260916_062222.up,
		down: migration_20260916_062222.down,
		name: "20260916_062222",
	},
	{
		up: migration_20260916_084953.up,
		down: migration_20260916_084953.down,
		name: "20260916_084953",
	},
	{
		up: migration_20260916_090228.up,
		down: migration_20260916_090228.down,
		name: "20260916_090228",
	},
	{
		up: migration_20260916_091500.up,
		down: migration_20260916_091500.down,
		name: "20260916_091500",
	},
	{
		up: migration_20260918_101800.up,
		down: migration_20260918_101800.down,
		name: "20260918_101800",
	},
	{
		up: migration_20260918_193000.up,
		down: migration_20260918_193000.down,
		name: "20260918_193000",
	},
	{
		up: migration_20260919_120900.up,
		down: migration_20260919_120900.down,
		name: "20260919_120900",
	},
	{
		up: migration_20260919_140536_add_payload_jobs.up,
		down: migration_20260919_140536_add_payload_jobs.down,
		name: "20260919_140536_add_payload_jobs",
	},
	{
		up: migration_20260919_151000.up,
		down: migration_20260919_151000.down,
		name: "20260919_151000",
	},
	{
		up: migration_20260921_185354_add_reset_password_requested_at.up,
		down: migration_20260921_185354_add_reset_password_requested_at.down,
		name: "20260921_185354_add_reset_password_requested_at",
	},
	{
		up: migration_20260924_111534.up,
		down: migration_20260924_111534.down,
		name: "20260924_111534",
	},
	{
		up: migration_20260924_134500_geo_hierarchy.up,
		down: migration_20260924_134500_geo_hierarchy.down,
		name: "20260924_134500_geo_hierarchy",
	},
	{
		up: migration_20260924_151000_property_geo_refs.up,
		down: migration_20260924_151000_property_geo_refs.down,
		name: "20260924_151000_property_geo_refs",
	},
];
