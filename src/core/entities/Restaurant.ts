import { Entity } from './Entity';

interface CreateRestaurantDTO {
  id?: string;
  name?: string;
}

export class Restaurant extends Entity {
  name: string;

  constructor(data: CreateRestaurantDTO) {
    super(data);
    this.name = data.name;
  }
}