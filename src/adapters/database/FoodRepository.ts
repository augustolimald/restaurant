import { Food } from '../../core/entities';

export interface GetFoodDTO {
  id: string;
}

export interface GetAllFoodDTO {
  category?: string;
}

export interface DeleteFoodDTO {
  id: string;
}

export interface FoodRepository {
  get(data: GetFoodDTO): Promise<Food>;
  getAll(data: GetAllFoodDTO): Promise<Food[]>;
  create(data: Food): Promise<Food>;
  update(data: Food): Promise<Food>;
  delete(data: DeleteFoodDTO): Promise<void>;
}