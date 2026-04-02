import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

config({ path: join(__dirname, '../../.env') });

import { ALL_ENTITIES } from './entities';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required for migrations');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url,
  entities: ALL_ENTITIES,
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
};

export default new DataSource(dataSourceOptions);
