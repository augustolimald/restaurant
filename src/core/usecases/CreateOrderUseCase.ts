import { Inject, Service } from 'typedi';
import { Order, OrderFood, OrderStatus } from '../entities';
import { UseCase } from './UseCase';
import { ClientRepository, FoodRepository, OrderRepository, RestaurantRepository, IngredientRepository } from '../../adapters/database';
import { PaymentGateway, QrCodeResponse } from '../../adapters/integration';

export interface CreateOrderRequestDTO {
  client_cpf?: string;
  restaurant_id: string;
  foods: [
    {
      food_id: string,
      quantity: number,
      ingredientsToAdd: string[],
      ingredientsToRemove: string[]
    }
  ];
}

export interface CreateOrderResponseDTO {
  order: Order,
  paymentData: QrCodeResponse,
}

@Service()
export class CreateOrderUseCase implements UseCase<CreateOrderRequestDTO, CreateOrderResponseDTO> {

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

  @Inject('mercadopago')
  private paymentGateway: PaymentGateway;

  async handle(input: CreateOrderRequestDTO): Promise<CreateOrderResponseDTO> {
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
    );

    order.createdDate = new Date();
    order.closedDate = null;
    order.status = OrderStatus.PENDING_PAYMENT;
    order.totalPrice = order.foods.reduce((sum, food) => sum + (food.price * food.quantity), 0);

    await this.orderRepository.create(order);

    const qrCodeData = await this.paymentGateway.generateQrCodeForOrder(order);

    // Avoid circular reference when converting to JSON
    order.foods.forEach(food => {
      food.order = undefined;
    });

    return {
      order,
      paymentData: qrCodeData,
    };
  }

}