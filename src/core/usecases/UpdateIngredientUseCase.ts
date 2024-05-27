import { Inject, Service } from 'typedi';

import { UseCase } from './UseCase';
import { Ingredient } from '../entities';
import { IngredientRepository } from '../../adapters/database';

export interface UpdateIngredientDTO {
	id: string;
	name: string;
	price: number;
}

@Service()
export class UpdateIngredientUseCase implements UseCase<UpdateIngredientDTO, Ingredient> {

	@Inject('ingredient.postgres')
	private ingredientRepository: IngredientRepository;

	async handle(input: UpdateIngredientDTO): Promise<Ingredient> {
		const ingredient = new Ingredient(input);

		const updatedIngredient = await this.ingredientRepository.update(ingredient);

		return updatedIngredient;
	}
}