import cors from 'cors';
import {Inject, Service} from 'typedi';
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { ClientController } from './ClientController';
import { FoodController } from './FoodController';
import { IngredientController } from './IngredientController';
import { OrderController } from './OrderController';
import { RestaurantController } from './RestaurantController';

import swaggerFile from '../../../docs/api/swagger.json';

@Service()
export class RestAPI {

	@Inject()
	clientController: ClientController;

	@Inject()
	foodController: FoodController;

	@Inject()
	ingredientController: IngredientController;

	@Inject()
	orderController: OrderController;

	@Inject()
	restaurantController: RestaurantController;

	public api: Express;

	public setup() {
		this.api = express();

		this.api.set('trust proxy', 1);

		this.api.use(express.json());
		this.api.use(cors());

		this.api.use(this.clientController.routes());
		this.api.use(this.foodController.routes());
		this.api.use(this.ingredientController.routes());
		this.api.use(this.orderController.routes());
		this.api.use(this.restaurantController.routes());

		this.api.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
	}
}