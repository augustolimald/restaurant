import { Inject, Service } from 'typedi';

import { UseCase } from './UseCase';
import { Restaurant } from '../entities';
import { RestaurantRepository } from '../../adapters/database';

export interface CreateRestaurantDTO {
  name: string;
}

@Service()
export class CreateRestaurantUseCase implements UseCase<CreateRestaurantDTO, Restaurant> {

  @Inject('restaurant.postgres')
  private restaurantRepository: RestaurantRepository;

  async handle(input: CreateRestaurantDTO): Promise<Restaurant> {
    const restaurant = new Restaurant(input);
    restaurant.id = restaurant.generateId();

    await this.restaurantRepository.create(restaurant);

    return restaurant;
  }
}