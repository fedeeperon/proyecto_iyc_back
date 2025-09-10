import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ImcEntity } from './src/module/imc/entities/imc.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ImcEntity],
  migrations: ['./src/migrations/*.ts'], // ubicación de tus migraciones
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
});
