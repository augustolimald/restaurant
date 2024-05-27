import { Client, Pool } from 'pg';
import { Service } from 'typedi';

@Service()
export class PostgresConnection {
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.POSTGRES_URL;
  }

  getClient() {
    return new Client({
      connectionString: this.connectionString
    });
  }

  getPool() {
    return new Pool({
      connectionString: this.connectionString
    });
  }
}