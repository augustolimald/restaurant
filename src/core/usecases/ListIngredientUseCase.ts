import { Inject, Service } from "typedi";

import { UseCase } from "./UseCase";
import { Ingredient } from "../entities";
import { IngredientRepository } from "../../adapters/database";

@Service()
export class ListIngredientUseCase implements UseCase<void, Ingredient[]> {

	@Inject('ingredient.postgres')
	private ingredientRepository: IngredientRepository;

	async handle(): Promise<Ingredient[]> {
		const ingredients = await this.ingredientRepository.get();
		return ingredients
	}
}