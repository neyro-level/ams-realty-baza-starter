import * as migration_20260916_062222 from './20260916_062222';
import * as migration_20260916_084953 from './20260916_084953';

export const migrations = [
  {
    up: migration_20260916_062222.up,
    down: migration_20260916_062222.down,
    name: '20260916_062222',
  },
  {
    up: migration_20260916_084953.up,
    down: migration_20260916_084953.down,
    name: '20260916_084953'
  },
];
