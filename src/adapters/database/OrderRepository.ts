import { Order } from '../../core/entities';

export interface GetOrderDTO {
  category?: string;
}

export interface OrderRepository {
  getStatus(id: string): Promise<string>;
  get(id: string): Promise<Order>;
  getAll(data: GetOrderDTO): Promise<Order[]>;
  create(data: Order): Promise<Order>;
  update(data: Order): Promise<Order>;
}