import { Inject, Service } from 'typedi';
import { Client } from '../entities';
import { UseCase } from './UseCase';
import { ClientRepository } from '../../adapters/database';

export interface CreateClientDTO {
  cpf: string;
  name: string;
  email: string;
}

@Service()
export class CreateClientUseCase implements UseCase<CreateClientDTO, Client> {

  @Inject('client.postgres')
  private clientRepository: ClientRepository;

  async handle(input: CreateClientDTO): Promise<Client> {
    const client = new Client(input);
    client.id = client.generateId();

    await this.clientRepository.create(client);

    return client;
  }
}