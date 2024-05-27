import { Inject, Service } from 'typedi';

import { Food, FoodCategory } from '../entities';
import { UseCase } from './UseCase';
import { FoodRepository } from '../../adapters/database';

export interface DeleteFoodDTO {
	id: string;
}

@Service()
export class DeleteFoodUseCase implements UseCase<DeleteFoodDTO, void> {

	@Inject('food.postgres')
	private foodRepository: FoodRepository;

	async handle(input: DeleteFoodDTO): Promise<void> {
		await this.foodRepository.delete(input);
	}
}