import * as migration_20260714_162514_initial from './20260714_162514_initial';

export const migrations = [
  {
    up: migration_20260714_162514_initial.up,
    down: migration_20260714_162514_initial.down,
    name: '20260714_162514_initial'
  },
];
