import { Inject, Service } from 'typedi';
import { Food, Ingredient } from '../../../core/entities';
import { FoodRepository, GetFoodDTO, GetAllFoodDTO, DeleteFoodDTO } from '../FoodRepository';
import { PostgresConnection } from './PostgresConnection';
import { ClientError, NotFoundError } from '../../../core/exceptions';
import { Pool } from 'pg';

@Service({ id: 'food.postgres'})
export class FoodPostgresRepository implements FoodRepository {

  @Inject()
  private connection: PostgresConnection;

  async get(data: GetFoodDTO): Promise<Food> {
    const pool = this.connection.getPool();

    const response = await pool.query(
      'SELECT f.*, json_agg(i.*) as ingredients FROM food f LEFT JOIN food_ingredient fi ON f.id = fi.food_id LEFT JOIN ingredient i ON fi.ingredient_id = i.id WHERE f.id = $1 AND visible = $2 GROUP BY f.id',
      [data.id, true]
    );

    pool.end();

    if (response.rowCount !== 1) {
      throw new NotFoundError(`Erro ao ler comida com id=${data.id}`);
    }

    return new Food({
      ...response.rows[0],
      ingredients: response
                      .rows[0]
                      .ingredients
                      .filter(ingredient => !!ingredient)
                      .map(ingredient => new Ingredient(ingredient))
    });
  }

  async getAll(data: GetAllFoodDTO): Promise<Food[]> {
    const pool = this.connection.getPool();

    const response = await pool.query(
      'SELECT f.*, json_agg(i.*) as ingredients FROM food f LEFT JOIN food_ingredient fi ON f.id = fi.food_id LEFT JOIN ingredient i ON fi.ingredient_id = i.id WHERE visible = $1 GROUP BY f.id',
      [true]
    );

    pool.end();

    return response.rows.map(row => new Food(
      {
        ...row,
        ingredients: row
                          .ingredients
                          .filter(ingredient => !!ingredient)
                          .map(ingredient => new Ingredient(ingredient))
      }
    ));
  }

  async create(data: Food): Promise<Food> {
    const pool = this.connection.getPool();

    pool.query('BEGIN');
    try {
      const food = await this.createFood(pool, data);
      await this.createIngredientsRelation(pool, data);

      pool.query('COMMIT');
      pool.end();

      return food;
    } catch (err) {
      pool.query('ROLLBACK');
      pool.end();
      throw new ClientError(`Erro ao cadastrar comida com id=${data.id}`);
    }
  }

  async update(data: Food): Promise<Food> {
    const pool = this.connection.getPool();

    pool.query('BEGIN');
    try {
      await this.removeIngredientsRelation(pool, data.id);
      const food = await this.updateFood(pool, data);
      await this.createIngredientsRelation(pool, data);

      pool.query('COMMIT');
      pool.end();

      return food;
    } catch (err) {
      pool.query('ROLLBACK');
      pool.end();
      throw new ClientError(`Erro ao atualizar comida com id=${data.id}`);
    }
  }

  async delete(data: DeleteFoodDTO): Promise<void> {
    const pool = this.connection.getPool();

    const response = await pool.query(
      'UPDATE food SET visible = $1 WHERE id = $2 RETURNING *',
      [false, data.id]
    );

    pool.end();

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao deletar comida com id=${data.id}`);
    }

    return;
  }

  private async createFood(pool: Pool, data: Food): Promise<Food> {
    const response = await pool.query(
      'INSERT INTO food (id, name, price, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.id, data.name, data.price, data.category]
    );

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao cadastrar comida com id=${data.id}`);
    }

    return new Food(response.rows[0]);
  }

  private async updateFood(pool: Pool, data: Food): Promise<Food> {
    const response = await pool.query(
      'UPDATE food SET name = $1, price = $2, category = $3 WHERE id = $4 RETURNING *',
      [data.name, data.price, data.category, data.id]
    );

    if (response.rowCount !== 1) {
      throw new ClientError(`Erro ao atualizar comida com id=${data.id}`);
    }

    return new Food(response.rows[0]);
  }

  private async createIngredientsRelation(pool: Pool, data: Food): Promise<any> {
    const ids = data.ingredients.map(ingredient => ingredient.id);
    const indexes = data.ingredients.map((_, index) => `($1, $${index+2})`);

    const response = await pool.query(
      `INSERT INTO food_ingredient (food_id, ingredient_id) VALUES ${indexes.join(',')} RETURNING *`,
      [data.id, ...ids]
    );

    if (response.rowCount !== data.ingredients.length) {
      throw new ClientError(`Erro ao cadastrar ingredientes da comida com id=${data.id}`);
    }

    return response.rows;
  }

  private async removeIngredientsRelation(pool: Pool, foodId: string): Promise<any> {
    const response = await pool.query(
      `DELETE FROM food_ingredient WHERE food_id = $1`,
      [foodId]
    );

    return response.rows;
  }

}