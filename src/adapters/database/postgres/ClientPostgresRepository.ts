import { Inject, Service } from "typedi";

import { Client } from "../../../core/entities";
import { PostgresConnection } from "./PostgresConnection";
import { NotFoundError, ServerError } from "../../../core/exceptions";
import { ClientRepository, GetClientByCpfDTO, GetClientDTO } from "../ClientRepository";

@Service({ id: 'client.postgres'})
export class ClientPostgresRepository implements ClientRepository {

	@Inject()
	private connection: PostgresConnection;

	async get(data: GetClientDTO): Promise<Client> {
		const pool = this.connection.getPool();

		const [[key, value]] = Object.entries(data);

		const response = await pool.query(
			`SELECT * FROM client WHERE ${key} = $1`,
			[value]
		);

		pool.end();

		if (response.rowCount !== 1) {
      throw new NotFoundError(`Cliente com ${key}='${value}' não existe`)
    }

		return new Client(response.rows[0]);
	}

	async getOrCreate(data: GetClientByCpfDTO): Promise<Client> {
		try {
			return this.get(data);
		} catch (error) {
			const client = new Client(data);
			client.id = client.generateId();
			return this.create(client);
		}
	}

	public async create(data: Client): Promise<Client> {
		const pool = this.connection.getPool();

		const keys = Object.keys(data)
		const values = Object.values(data)
		const indexes = keys.map((_, index) => `$${index + 1}`);

		const response = await pool.query(
			`INSERT INTO client(${keys.join(', ')}) VALUES (${indexes.join(', ')}) RETURNING *`,
			[...values]
		);

		pool.end();

		if (response.rowCount !== 1) {
      throw new ServerError(`Erro ao salvar cliente com id = ${data.id}`)
    }

		return new Client(response.rows[0]);
	}
}