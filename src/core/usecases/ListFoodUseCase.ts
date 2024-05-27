import { Inject, Service } from 'typedi';

import { Food } from '../entities';
import { UseCase } from './UseCase';
import { FoodRepository } from '../../adapters/database';

export interface ListFoodDTO {
	category?: string;
}

@Service()
export class ListFoodUseCase implements UseCase<ListFoodDTO, Food[]> {

	@Inject('food.postgres')
	private foodRepository: FoodRepository;

	async handle(input: ListFoodDTO): Promise<Food[]> {
		return this.foodRepository.getAll(input);
	}
}