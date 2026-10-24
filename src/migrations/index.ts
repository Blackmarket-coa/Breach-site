import * as migration_20260714_162514_initial from './20260714_162514_initial';
import * as migration_20260720_004246_add_information_requests from './20260720_004246_add_information_requests';
import * as migration_20261024_012555_payload_3_92_upgrade from './20261024_012555_payload_3_92_upgrade';

export const migrations = [
  {
    up: migration_20260714_162514_initial.up,
    down: migration_20260714_162514_initial.down,
    name: '20260714_162514_initial',
  },
  {
    up: migration_20260720_004246_add_information_requests.up,
    down: migration_20260720_004246_add_information_requests.down,
    name: '20260720_004246_add_information_requests',
  },
  {
    up: migration_20261024_012555_payload_3_92_upgrade.up,
    down: migration_20261024_012555_payload_3_92_upgrade.down,
    name: '20261024_012555_payload_3_92_upgrade'
  },
];
