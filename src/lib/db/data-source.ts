import "reflect-metadata";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [`${__dirname}/entities/**/*.{ts,js}`],
  migrations: [`${__dirname}/migrations/**/*.{ts,js}`],
});

declare global {
  // eslint-disable-next-line no-var
  var __typeormDataSource: DataSource | undefined;
  // eslint-disable-next-line no-var
  var __typeormInitPromise: Promise<DataSource> | undefined;
}

export async function getDataSource(): Promise<DataSource> {
  if (global.__typeormDataSource?.isInitialized) {
    return global.__typeormDataSource;
  }

  if (!global.__typeormInitPromise) {
    global.__typeormDataSource = AppDataSource;
    global.__typeormInitPromise = AppDataSource.initialize();
  }

  return global.__typeormInitPromise;
}

export default AppDataSource;
