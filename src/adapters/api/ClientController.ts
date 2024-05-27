import { Inject, Service } from 'typedi';
import { Router, Request, Response, NextFunction } from 'express';
import { CreateClientUseCase } from '../../core/usecases';
import { Controller } from './Controller';

@Service()
export class ClientController implements Controller {

	@Inject()
	public createClientUseCase: CreateClientUseCase;

	public routes(): Router {
		const router = Router();

		router.post('/clients', (req, res, next) => this.create(req, res, next));

		return router;
	}

	public async create(request: Request, response: Response, next: NextFunction): Promise<Response> {
		const client = await this.createClientUseCase.handle({
			cpf: request.body.cpf,
			name: request.body.name,
			email: request.body.email
		});

		return response.status(201).json(client);
	}
}