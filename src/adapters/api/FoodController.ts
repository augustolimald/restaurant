import { Inject, Service } from "typedi";
import { NextFunction, Request, Response, Router } from "express";

import { Controller } from "./Controller";
import { CreateFoodUseCase, ListFoodUseCase, UpdateFoodUseCase, DeleteFoodUseCase } from "../../core/usecases";

@Service()
export class FoodController implements Controller {

	@Inject()
	private createFoodUseCase: CreateFoodUseCase;

	@Inject()
	private updateFoodUseCase: UpdateFoodUseCase;

	@Inject()
	private deleteFoodUseCase: DeleteFoodUseCase;

	@Inject()
	private listFoodUseCase: ListFoodUseCase;


	public routes(): Router {
		const router = Router();

		router.get('/foods', (req, res, next) => this.index(req, res, next));
		router.post('/foods', (req, res, next) => this.create(req, res, next));
		router.put('/foods/:food_id', (req, res, next) => this.update(req, res, next));
		router.delete('/foods/:food_id', (req, res, next) => this.delete(req, res, next));

		return router;
	}

	public async index(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const foods = await this.listFoodUseCase.handle({
			category: request.query.category as string | undefined,
		});

		return response.status(200).json(foods);
	}

	public async create(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const food = await this.createFoodUseCase.handle({
			name: request.body.name,
			price: request.body.price,
			category: request.body.category,
			ingredients: request.body.ingredients,
		});

		return response.status(201).json(food);
	}

	public async update(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const food = await this.updateFoodUseCase.handle({
			id: request.params.food_id,
			name: request.body.name,
			price: request.body.price,
			category: request.body.category,
			ingredients: request.body.ingredients,
		});

		return response.status(200).json(food);
	}

	public async delete(request: Request, response: Response, next: NextFunction): Promise<Response>{
		await this.deleteFoodUseCase.handle({
			id: request.params.food_id,
		});

		return response.status(204).json();
	}
}