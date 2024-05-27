import { Order } from "../../core/entities";

export interface GetOrderDTO {
	category?: string;
}

export interface OrderRepository {
	getAll(data: GetOrderDTO): Promise<Order[]>;
	create(data: Order): Promise<Order>;
}