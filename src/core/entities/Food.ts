import { Entity } from './Entity';
import { Ingredient } from './Ingredient';

interface CreateFoodDTO {
	id?: string;
	name?: string;
	price?: number;
	category?: FoodCategory;
	ingredients?: Ingredient[];
}

export enum FoodCategory {
	SNACK = 'Lanche',
	ACCOMPANIANT = 'Acompanhamento',
	DRINK = 'Bebida',
	DESSERT = 'Sobremesa'
}

export class Food extends Entity {
	name: string;
	price: number;
	category: FoodCategory;
	ingredients: Ingredient[];

	constructor(data: CreateFoodDTO) {
		super(data);
		this.name = data.name;
		this.price = data.price;
		this.category = data.category;
		this.ingredients = data.ingredients;
	}
}