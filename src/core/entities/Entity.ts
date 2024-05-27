import { v4 as uuidv4 } from 'uuid';

interface CreateEntityDTO {
	id?: string;
}

export abstract class Entity {
	id: string;

	constructor(data: CreateEntityDTO) {
		this.id = data.id;
	}

	generateId() {
		if (!this.id || this.id === '') {
			return uuidv4();
		} else {
			return this.id;
		}
	}
}