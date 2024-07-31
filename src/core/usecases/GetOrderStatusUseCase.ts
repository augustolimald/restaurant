import { Inject, Service } from 'typedi';

import { UseCase } from './UseCase';
import { OrderRepository } from '../../adapters/database';

@Service()
export class GetOrderStatusUseCase implements UseCase<string, string> {

  @Inject('order.postgres')
  private orderRepository: OrderRepository;

  async handle(id: string): Promise<string> {
    return await this.orderRepository.getStatus(id);
  }
}