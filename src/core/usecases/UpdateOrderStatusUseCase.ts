import { Inject, Service } from 'typedi';

import { UseCase } from './UseCase';
import { OrderRepository } from '../../adapters/database';
import { Order, OrderStatus } from '../entities';

export interface UpdateOrderStatusDTO {
  id: string,
  status: string,
}

const allowedTransitions = [
  [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELED],
  [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS],
  [OrderStatus.IN_PROGRESS, OrderStatus.DONE],
  [OrderStatus.DONE, OrderStatus.COMPLETED],
]

@Service()
export class UpdateOrderStatusUseCase implements UseCase<UpdateOrderStatusDTO, Order> {

  @Inject('order.postgres')
  private orderRepository: OrderRepository;

  async handle(input: UpdateOrderStatusDTO): Promise<Order> {
    const order = await this.orderRepository.get(input.id);

    if (allowedTransitions.find(t => t[0] === order.status && t[1].toString() === input.status)) {
      order.status = input.status as OrderStatus;
    } else {
      throw new Error("Transição de status não permitida");
    }

    await this.orderRepository.update(order);

    return order;
  }
}