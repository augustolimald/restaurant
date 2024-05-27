import { Inject, Service } from "typedi";

import { Controller } from "./Controller";
import { Request, Response, Router, NextFunction } from "express";
import { CreateOrderUseCase, ListOrderUseCase } from "../../core/usecases";

@Service()
export class OrderController implements Controller {

	@Inject()
	private createOrderUseCase: CreateOrderUseCase;

	@Inject()
	private listOrderUseCase: ListOrderUseCase;

	public routes(): Router {
		const router = Router();

		router.get('/orders', (req, res, next) => this.index(req, res, next));
		router.post('/orders', (req, res, next) => this.create(req, res, next));

		return router;
	}

	public async index(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const orders = await this.listOrderUseCase.handle({
			category: request.query.category as string | undefined,
		});

		return response.status(200).json(orders);
	}

	public async create(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const order = await this.createOrderUseCase.handle({
			client_cpf: request.body.client_cpf,
			restaurant_id: request.body.restaurant_id,
			foods: request.body.foods,
		});

		// Avoid circular reference when converting to JSON
		order.foods.forEach(food => {
			food.order = undefined;
		})

		return response.status(201).json(order);
	}
}