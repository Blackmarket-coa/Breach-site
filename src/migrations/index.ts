import * as migration_20260714_162514_initial from './20260714_162514_initial';
import * as migration_20260720_004246_add_information_requests from './20260720_004246_add_information_requests';

export const migrations = [
  {
    up: migration_20260714_162514_initial.up,
    down: migration_20260714_162514_initial.down,
    name: '20260714_162514_initial',
  },
  {
    up: migration_20260720_004246_add_information_requests.up,
    down: migration_20260720_004246_add_information_requests.down,
    name: '20260720_004246_add_information_requests'
  },
];
