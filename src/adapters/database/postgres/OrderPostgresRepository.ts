import { Inject, Service } from 'typedi';

import { Client, Food, Order, OrderFood, Restaurant } from '../../../core/entities';
import { GetOrderDTO, OrderRepository } from '../OrderRepository';
import { PostgresConnection } from './PostgresConnection';
import { ClientError } from '../../../core/exceptions';
import { Pool } from 'pg';

@Service({ id: 'order.postgres'})
export class OrderPostgresRepository implements OrderRepository {

  @Inject()
  private connection: PostgresConnection;

  async getAll(data: GetOrderDTO): Promise<Order[]> {
    const pool = this.connection.getPool();

    const response = await pool.query(
      'SELECT o.id,o.createdDate,o.closedDate,o.totalPrice,o.status, json_agg(client.*) as client, json_agg(restaurant.*) as restaurant, json_agg(ofo.*) as food FROM "order" o LEFT JOIN (SELECT ofo.*, json_agg(f.*) as food FROM order_food ofo LEFT JOIN food f ON ofo.food_id = f.id GROUP BY ofo.id) ofo ON o.id = ofo.order_id LEFT JOIN client ON o.client_id = client.id LEFT JOIN restaurant ON restaurant.id = o.restaurant_id GROUP BY o.id',
      []
    );

    pool.end();

    return response.rows.map(row => new Order({
      id: row.id,
      client: row.client ? new Client(row.client[0]): null,
      restaurant: new Restaurant(row.restaurant[0]),
      foods: row.food.map(food => new OrderFood({
        id: food.id,
        quantity: food.quantity,
        price: food.price,
        comments: food.comments,
        food: new Food(food.food[0])
      })),
      totalPrice: row.totalprice,
      status: row.status,
      createdDate: row.createddate,
      closedDate: row.closeddate
    }));
  }

  async create(data: Order): Promise<Order> {
    const pool = this.connection.getPool();

    pool.query('BEGIN');
    try {
      await this.createOrder(pool, data);
      await Promise.all(
        data.foods.map(async food => {
          await this.createOrderFood(pool, food);
          await this.createOrderFoodIngredient(pool, food);
        })
      );

      pool.query('COMMIT');
      pool.end();

      return data;
    } catch (err) {
      console.log(err);
      pool.query('ROLLBACK');
      pool.end();
      throw new ClientError(`Erro ao cadastrar pedido com id=${data.id}`);
    }
  }

  private async createOrder(pool: Pool, data: Order): Promise<any> {
    const response = await pool.query(
      'INSERT INTO "order" (id, client_id, restaurant_id, createdDate, closedDate, totalPrice, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [data.id, data.client?.id, data.restaurant.id, data.createdDate, data.closedDate, data.totalPrice, data.status]
    );

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao cadastrar oder com id=${data.id}`);
    }

    return new Order(response.rows[0]);
  }

  private async createOrderFood(pool: Pool, data: OrderFood): Promise<any> {
    const response = await pool.query(
      'INSERT INTO order_food (id, order_id, food_id, quantity, price, comments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.id, data.order.id, data.food.id, data.quantity, data.price, data.comments]
    );

    return response.rows;
  }

  private async createOrderFoodIngredient(pool: Pool, data: OrderFood): Promise<any> {
    const ids = data.ingredients.map(ingredient => ingredient.id);
    const indexes = data.ingredients.map((_, index) => `($1, $${index+2})`);

    const response = await pool.query(
      `INSERT INTO order_food_ingredient (order_food_id, ingredient_id) VALUES ${indexes.join(',')} RETURNING *`,
      [data.id, ...ids]
    );

    return response.rows;
  }

  async get(id: string): Promise<Order> {
    const pool = this.connection.getPool();
  
    const response = await pool.query(
      'SELECT o.id,o.createdDate,o.closedDate,o.totalPrice,o.status, json_agg(client.*) as client, json_agg(restaurant.*) as restaurant, json_agg(ofo.*) as food FROM "order" o LEFT JOIN (SELECT ofo.*, json_agg(f.*) as food FROM order_food ofo LEFT JOIN food f ON ofo.food_id = f.id GROUP BY ofo.id) ofo ON o.id = ofo.order_id LEFT JOIN client ON o.client_id = client.id LEFT JOIN restaurant ON restaurant.id = o.restaurant_id WHERE o.id = $1 GROUP BY o.id',
      [id]
    );

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao pegar order com id=${id}`);
    }

    return new Order({
      id: response.rows[0].id,
      client: response.rows[0].client ? new Client(response.rows[0].client[0]): null,
      restaurant: new Restaurant(response.rows[0].restaurant[0]),
      foods: response.rows[0].food.map(food => new OrderFood({
        id: food.id,
        quantity: food.quantity,
        price: food.price,
        comments: food.comments,
        food: new Food(food.food[0])
      })),
      totalPrice: response.rows[0].totalprice,
      status: response.rows[0].status,
      createdDate: response.rows[0].createddate,
      closedDate: response.rows[0].closeddate
    });
  }

  async getStatus(id: string): Promise<string> {
    const pool = this.connection.getPool();
  
    const response = await pool.query(
      'SELECT status FROM "order" WHERE id = $1',
      [id]
    );

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao pegar status de order com id=${id}`);
    }

    return response.rows[0].status;
  }

  async update(data: Order): Promise<Order> {
    const pool = this.connection.getPool();
  
    const response = await pool.query(
      'UPDATE "order" SET client_id = $1, restaurant_id = $2, closedDate = $3, totalPrice = $4, status = $5 WHERE id = $6 RETURNING *',
      [data.client?.id, data.restaurant.id, data.closedDate, data.totalPrice, data.status, data.id]
    );

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao atualizar order com id=${data.id}`);
    }

    return response.rows[0];
  }
}