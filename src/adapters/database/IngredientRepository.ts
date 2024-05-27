import { Ingredient } from "../../core/entities";

export interface GetIngredientFromListDTO {
	ids: string[];
}

export interface CreateIngredientDTO {
	cpf: string;
}

export interface IngredientRepository {
	get(): Promise<Ingredient[]>;
	getFromList(data: GetIngredientFromListDTO): Promise<Ingredient[]>;
	create(data: Ingredient): Promise<Ingredient>;
	update(data: Ingredient): Promise<Ingredient>;
}