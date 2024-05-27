import { Inject, Service } from 'typedi';

import { Food, FoodCategory } from '../entities';
import { UseCase } from './UseCase';
import { FoodRepository, IngredientRepository } from '../../adapters/database';

export interface CreateFoodDTO {
	name: string;
	price: number;
	category: string;
	ingredients: string[];
}

@Service()
export class CreateFoodUseCase implements UseCase<CreateFoodDTO, Food> {

	@Inject('ingredient.postgres')
	private ingredientRepository: IngredientRepository;

	@Inject('food.postgres')
	private foodRepository: FoodRepository;

	async handle(input: CreateFoodDTO): Promise<Food> {
		const ingredients = await this.ingredientRepository.getFromList({ ids: input.ingredients });

		const food = new Food({
			name: input.name,
			price: input.price,
			category: FoodCategory.SNACK,
			ingredients
		});

		food.id = food.generateId();

		await this.foodRepository.create(food);

		return food;
	}
}