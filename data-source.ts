import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/module/user/entities/user.entity';
import { ImcEntity } from 'src/module/imc/entities/imc.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.MONGO_URI,
  // Alternativamente:
  // host: process.env.DB_HOST || 'localhost',
  // port: parseInt(process.env.DB_PORT || '27017'),
  // database: process.env.DB_NAME || 'calculadora-imc',
  // username: process.env.DB_USER, // opcional
  // password: process.env.DB_PASSWORD, // opcional
  entities: [User, ImcEntity],
  migrations: ['./src/migrations/*.ts'], // ubicación de tus migraciones
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
});
