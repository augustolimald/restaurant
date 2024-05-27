import { Inject, Service } from "typedi";

import { UseCase } from "./UseCase";
import { Restaurant } from "../entities";
import { RestaurantRepository } from "../../adapters/database";

@Service()
export class ListAllRestaurantUseCase implements UseCase<void, Restaurant[]> {

	@Inject('restaurant.postgres')
	private restaurantRepository: RestaurantRepository;

	async handle(): Promise<Restaurant[]> {
		const restaurants = await this.restaurantRepository.getAll({});
		return restaurants
	}
}