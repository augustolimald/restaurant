import { Inject, Service } from "typedi";
import { NextFunction, Request, Response, Router } from "express";

import { Controller } from "./Controller";
import { CreateIngredientUseCase, UpdateIngredientUseCase, ListIngredientUseCase } from "../../core/usecases";

@Service()
export class IngredientController implements Controller {

	@Inject()
	private createIngredientUseCase: CreateIngredientUseCase;

	@Inject()
	private updateIngredientUseCase: UpdateIngredientUseCase;

	@Inject()
	private listIngredientUseCase: ListIngredientUseCase;

	public routes(): Router {
		const router = Router();

		router.get('/ingredients', (req, res, next) => this.index(req, res, next));
		router.post('/ingredients', (req, res, next) => this.create(req, res, next));
		router.put('/ingredients/:ingredient_id', (req, res, next) => this.update(req, res, next));

		return router;
	}

	public async index(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const ingredients = await this.listIngredientUseCase.handle();
		return response.status(200).json(ingredients);
	}

	public async create(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const ingredient = await this.createIngredientUseCase.handle({
			name: request.body.name,
			price: request.body.price,
		});

		return response.status(201).json(ingredient);
	}

	public async update(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const ingredient = await this.updateIngredientUseCase.handle({
			id: request.params.ingredient_id,
			name: request.body.name,
			price: request.body.price,
		});

		return response.status(200).json(ingredient);
	}
}