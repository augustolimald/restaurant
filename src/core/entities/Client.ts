import { Entity } from './Entity';

interface CreateClientDTO {
  id?: string;
  cpf?: string;
  name?: string;
  email?: string;
}

export class Client extends Entity {
  cpf: string;
  name: string;
  email: string;

  constructor(data: CreateClientDTO) {
    super(data);
    this.cpf = data.cpf;
    this.name = data.name;
    this.email = data.email;
  }
}