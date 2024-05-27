import { Client } from "./Client";
import { Entity } from "./Entity";
import { Food } from "./Food";
import { Ingredient } from "./Ingredient";
import { Restaurant } from "./Restaurant";

interface CreateOrderFoodDTO {
	id?: string;
	food?: Food;
	order?: Order;
	price?: number;
	quantity?: number;
	ingredients?: Ingredient[];
	comments?: string;
}

interface CreateOrderDTO {
	id?: string;
	client?: Client;
	restaurant?: Restaurant;
	foods?: OrderFood[];
	status?: OrderStatus;
	createdDate?: Date;
	closedDate?: Date;
	totalPrice?: number;
}

export enum OrderStatus {
	PENDING_PAYMENT = 'Aguardando Pagamento',
	CANCELED = 'Cancelado',
	CONFIRMED = 'Recebido',
	IN_PROGRESS = 'Em Preparação',
	DONE = 'Pronto',
	COMPLETED = 'Finalizado'
}

export class OrderFood extends Entity {
	food: Food;
	order: Order;
	price: number;
	quantity: number;
	ingredients: Ingredient[];
	comments: string;

	constructor(data: CreateOrderFoodDTO) {
		super(data);
		this.food = data.food;
		this.order = data.order;
		this.price = data.price;
		this.quantity = data.quantity;
		this.ingredients = data.ingredients;
		this.comments = data.comments;
	}
}

export class Order extends Entity {
	client: Client;
	restaurant: Restaurant;
	foods: OrderFood[];
	status: OrderStatus;
	createdDate: Date;
	closedDate: Date;
	totalPrice: number;

	constructor(data: CreateOrderDTO) {
		super(data);
		this.client = data.client;
		this.restaurant = data.restaurant;
		this.foods = data.foods;
		this.status = data.status;
		this.createdDate = data.createdDate;
		this.closedDate = data.closedDate;
		this.totalPrice = data.totalPrice;
	}
}