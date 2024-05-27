import { Inject, Service } from 'typedi';

import { UseCase } from './UseCase';
import { Ingredient } from '../entities';
import { IngredientRepository } from '../../adapters/database';

export interface CreateIngredientDTO {
  name: string;
  price: number;
}

@Service()
export class CreateIngredientUseCase implements UseCase<CreateIngredientDTO, Ingredient> {

  @Inject('ingredient.postgres')
  private ingredientRepository: IngredientRepository;

  async handle(input: CreateIngredientDTO): Promise<Ingredient> {
    const ingredient = new Ingredient(input);
    ingredient.id = ingredient.generateId();

    await this.ingredientRepository.create(ingredient);

    return ingredient;
  }
}