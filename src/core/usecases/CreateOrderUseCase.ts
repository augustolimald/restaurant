import { Inject, Service } from "typedi";
import { Order, OrderFood, OrderStatus } from "../entities";
import { UseCase } from "./UseCase";
import { ClientRepository, FoodRepository, OrderRepository, RestaurantRepository, IngredientRepository } from "../../adapters/database";

export interface CreateOrderDTO {
	client_cpf?: string,
	restaurant_id: string,
	foods: [
		{
			food_id: string,
			quantity: number,
			ingredientsToAdd: string[],
			ingredientsToRemove: string[],
		}
	]
}

@Service()
export class CreateOrderUseCase implements UseCase<CreateOrderDTO, Order> {

	@Inject('client.postgres')
	private clientRepository: ClientRepository;

	@Inject('restaurant.postgres')
	private restaurantRepository: RestaurantRepository;

	@Inject('food.postgres')
	private foodRepository: FoodRepository;

	@Inject('ingredient.postgres')
	private ingredientRepository: IngredientRepository;

	@Inject('order.postgres')
	private orderRepository: OrderRepository;
	
	async handle(input: CreateOrderDTO): Promise<Order> {
		const order = new Order({});
		order.id = order.generateId();

		const client = await this.clientRepository.getOrCreate({ cpf: input.client_cpf });
		order.client = client;

		const restaurant = await this.restaurantRepository.get({ id: input.restaurant_id });
		order.restaurant = restaurant;

		order.foods = await Promise.all(
			input.foods.map(async (inputFood): Promise<OrderFood> => {
				const orderFood = new OrderFood({});
				orderFood.id = orderFood.generateId();
				orderFood.order = order;
				
				const food = await this.foodRepository.get({ id: inputFood.food_id });
				orderFood.food = food;
				orderFood.quantity = inputFood.quantity;
				orderFood.price = food.price;
				orderFood.ingredients = [...food.ingredients];
				orderFood.food.ingredients = undefined;
				orderFood.comments = '';

				if (inputFood.ingredientsToAdd.length > 0) {
					const ingredientsToAdd = await this.ingredientRepository.getFromList({ ids: inputFood.ingredientsToAdd });
					orderFood.ingredients.push(...ingredientsToAdd);
					orderFood.comments += `Adicionar ${ingredientsToAdd.map(ingredient => ingredient.name).join(',')} | `;
					orderFood.price += ingredientsToAdd.reduce((sum, ingredient) => sum + ingredient.price, 0);
				}

				if (inputFood.ingredientsToRemove.length > 0) {
					const ingredientsToRemove = await this.ingredientRepository.getFromList({ ids: inputFood.ingredientsToRemove });
					
					ingredientsToRemove.forEach(ingredientToRemove => {
						const index = orderFood.ingredients.findIndex(ingredient => ingredient.id === ingredientToRemove.id);
						if (index >= 0) {
							orderFood.ingredients.splice(index, 1);
						}
					});

					orderFood.comments += `Remover ${ingredientsToRemove.map(ingredient => ingredient.name).join(',')}`;
				}

				return orderFood;
			})
		)

		order.createdDate = new Date();
		order.closedDate = null;
		order.status = OrderStatus.CONFIRMED;
		order.totalPrice = order.foods.reduce((sum, food) => sum + (food.price * food.quantity), 0);

		// TODO: set status to pending payment and create payment routes

		await this.orderRepository.create(order);

		return order;
	}

}