import { Restaurant } from '../../core/entities';

export interface GetRestaurantDTO {
  id: string;
}

export interface GetAllRestaurantDTO {}

export interface RestaurantRepository {
  get(data: GetRestaurantDTO): Promise<Restaurant>;
  getAll(data: GetAllRestaurantDTO): Promise<Restaurant[]>;
  create(data: Restaurant): Promise<Restaurant>;
}