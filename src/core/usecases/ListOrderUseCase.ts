import { Inject, Service } from 'typedi';

import { Order } from '../entities';
import { UseCase } from './UseCase';
import { OrderRepository } from '../../adapters/database';

export interface ListOrderDTO {
	category?: string;
}

@Service()
export class ListOrderUseCase implements UseCase<ListOrderDTO, Order[]> {

	@Inject('order.postgres')
	private orderRepository: OrderRepository;

	async handle(input: ListOrderDTO): Promise<Order[]> {
		const orders = await this.orderRepository.getAll({});
		return orders;
	}
}