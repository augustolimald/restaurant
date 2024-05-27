import { Inject, Service } from 'typedi';

import { UseCase } from './UseCase';
import { Food, FoodCategory } from '../entities';
import { FoodRepository, IngredientRepository } from '../../adapters/database';

export interface UpdateFoodDTO {
	id: string;
	name: string;
	price: number;
	category: string;
	ingredients: string[];
}

@Service()
export class UpdateFoodUseCase implements UseCase<UpdateFoodDTO, Food> {

	@Inject('ingredient.postgres')
	private ingredientRepository: IngredientRepository;

	@Inject('food.postgres')
	private foodRepository: FoodRepository;

	async handle(input: UpdateFoodDTO): Promise<Food> {
		const ingredients = await this.ingredientRepository.getFromList({ ids: input.ingredients });

		const food = new Food({
			id: input.id,
			name: input.name,
			price: input.price,
			category: FoodCategory.SNACK,
			ingredients
		});

		await this.foodRepository.update(food);

		return food;
	}
}