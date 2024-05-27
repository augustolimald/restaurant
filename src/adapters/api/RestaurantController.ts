import { Inject, Service } from 'typedi';
import { Request, Response, Router, NextFunction } from 'express';
import { Controller } from './Controller';
import { CreateRestaurantUseCase } from '../../core/usecases/CreateRestaurantUseCase';
import { ListAllRestaurantUseCase } from '../../core/usecases/ListAllRestaurantUseCase';

@Service()
export class RestaurantController implements Controller {

	@Inject()
	private createRestaurantUseCase: CreateRestaurantUseCase;

	@Inject()
	private listAllRestaurantUseCase: ListAllRestaurantUseCase;


	public routes(): Router {
		const router = Router();

		router.get('/restaurants', (req, res, next) => this.index(req, res, next));
		router.post('/restaurants', (req, res, next) => this.create(req, res, next));

		return router;
	}

	public async index(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const restaurants = await this.listAllRestaurantUseCase.handle();
		return response.status(200).json(restaurants);
	}

	public async create(request: Request, response: Response, next: NextFunction): Promise<Response>{
		const restaurant = await this.createRestaurantUseCase.handle({
			name: request.body.name
		});

		return response.status(201).json(restaurant);
	}
}