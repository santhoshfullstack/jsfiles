import { DataSource } from 'typeorm';
import { User } from '../entities/User';  // Import your entity
import { Admin } from '../entities/Admin';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Hemasanthosh@8884',
  database: 'testorm',
  synchronize: true,  // Automatically synchronize the schema (development only)
  logging: false,
  entities: [User, Admin],
  migrations: [],
  subscribers: [],
});
