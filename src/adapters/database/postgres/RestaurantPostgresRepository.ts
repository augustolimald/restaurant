import { Inject, Service } from 'typedi';

import { Restaurant } from '../../../core/entities';
import { PostgresConnection } from './PostgresConnection';
import { ServerError, NotFoundError } from '../../../core/exceptions';
import { GetAllRestaurantDTO, GetRestaurantDTO, RestaurantRepository } from '../RestaurantRepository';

@Service({ id: 'restaurant.postgres'})
export class RestaurantPostgresRepository implements RestaurantRepository {

  @Inject()
  private connection: PostgresConnection;

  async get(data: GetRestaurantDTO): Promise<Restaurant> {
    const pool = this.connection.getPool();

    const response = await pool.query(
      'SELECT * FROM restaurant WHERE id = $1',
      [data.id]
    );

    pool.end();

    if (response.rowCount !== 1) {
      throw new NotFoundError(`Erro ao procurar restaurante com id = ${data.id}`);
    }

    return new Restaurant(response.rows[0]);
  }

  async getAll(data: GetAllRestaurantDTO): Promise<Restaurant[]> {
    const pool = this.connection.getPool();

    const response = await pool.query(
      'SELECT * FROM restaurant',
      []
    );

    pool.end();

    return response.rows.map(row => new Restaurant(row));
  }

  async create(data: Restaurant): Promise<Restaurant> {
    const pool = this.connection.getPool();

    const keys = Object.keys(data);
    const values = Object.values(data);
    const indexes = keys.map((_, index) => `$${index + 1}`);

    const response = await pool.query(
      `INSERT INTO restaurant(${keys.join(', ')}) VALUES (${indexes.join(', ')}) RETURNING *`,
      [...values]
    );

    pool.end();

    if (response.rowCount !== 1) {
      throw new ServerError(`Erro ao salvar restaurante com id = ${data.id}`);
    }

    return new Restaurant(response.rows[0]);
  }
}