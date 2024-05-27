import { Inject, Service } from "typedi";

import { Ingredient } from "../../../core/entities";
import { PostgresConnection } from "./PostgresConnection";
import { ServerError, NotFoundError } from "../../../core/exceptions";
import { GetIngredientFromListDTO, IngredientRepository } from "../IngredientRepository";

@Service({ id: 'ingredient.postgres'})
export class IngredientPostgresRepository implements IngredientRepository {
	
	@Inject()
	private connection: PostgresConnection;

	async get(): Promise<Ingredient[]> {
		const pool = this.connection.getPool();

		const response = await pool.query(
			'SELECT * FROM ingredient',
			[]
		);

		pool.end();

		return response.rows.map(row => new Ingredient(row));
	}
	
	async getFromList(data: GetIngredientFromListDTO): Promise<Ingredient[]> {
		const pool = this.connection.getPool();

		const values = data.ids;
		const indexes = values.map((_, index) => `$${index + 1}`);

		const response = await pool.query(
			`SELECT * FROM ingredient WHERE id IN (${indexes.join(',')})`,
			[...values]
		);

		pool.end();

		if (response.rowCount !== values.length) {
      throw new NotFoundError(`Erro ao procurar ingredientes com ids = ${values.join(',')}`)
    }

		return response.rows.map(row => new Ingredient(row));
	}

	async create(data: Ingredient): Promise<Ingredient> {
		const pool = this.connection.getPool();

		const keys = Object.keys(data)
		const values = Object.values(data)
		const indexes = keys.map((_, index) => `$${index + 1}`);

		const response = await pool.query(
			`INSERT INTO ingredient(${keys.join(', ')}) VALUES (${indexes.join(', ')}) RETURNING *`,
			[...values]
		);

		pool.end();

		if (response.rowCount !== 1) {
      throw new ServerError(`Erro ao salvar ingredient com id = ${data.id}`)
    }

		return new Ingredient(response.rows[0]);
	}

	async update(data: Ingredient): Promise<Ingredient> {
		const pool = this.connection.getPool();

		const response = await pool.query(
			'UPDATE ingredient SET name = $1, price = $2 WHERE id = $3 RETURNING *',
			[data.name, data.price, data.id]
		);

		pool.end();

		if (response.rowCount !== 1) {
      throw new ServerError(`Erro ao salvar ingredient com id = ${data.id}`)
    }

		return new Ingredient(response.rows[0]);
	}
}