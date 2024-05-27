import { Entity } from './Entity';

interface CreateIngredientDTO {
	id?: string;
	name?: string;
	price?: number;
}

export class Ingredient extends Entity {
	name: string;
	price: number;

	constructor(data: CreateIngredientDTO) {
		super(data);
		this.name = data.name;
		this.price = data.price;
	}
}