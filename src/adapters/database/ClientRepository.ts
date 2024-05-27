import { Client } from '../../core/entities';

export interface GetClientByIdDTO {
	id: string;
}

export interface GetClientByCpfDTO {
	cpf: string;
}

export type GetClientDTO = GetClientByIdDTO | GetClientByCpfDTO;

export interface ClientRepository {
	get(data: GetClientDTO): Promise<Client>;
	getOrCreate(data: GetClientByCpfDTO): Promise<Client>;
	create(data: Client): Promise<Client>;
}