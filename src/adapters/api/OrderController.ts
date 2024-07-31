import { Inject, Service } from 'typedi';

import { Controller } from './Controller';
import { Request, Response, Router, NextFunction } from 'express';
import { CreateOrderUseCase, ListOrderUseCase, GetOrderStatusUseCase, UpdateOrderStatusUseCase } from '../../core/usecases';

@Service()
export class OrderController implements Controller {

  @Inject()
  private createOrderUseCase: CreateOrderUseCase;

  @Inject()
  private listOrderUseCase: ListOrderUseCase;

  @Inject()
  private getOrderStatusUseCase: GetOrderStatusUseCase;

  @Inject()
  private updateOrderStatusUseCase: UpdateOrderStatusUseCase;

  public routes(): Router {
    const router = Router();

    router.get('/orders', (req, res, next) => this.index(req, res, next));
    router.post('/orders', (req, res, next) => this.create(req, res, next));
    router.get('/orders/:order_id/status', (req, res, next) => this.getStatus(req, res, next));
    router.patch('/orders/:order_id/status', (req, res, next) => this.updateStatus(req, res, next));

    return router;
  }

  public async getStatus(request: Request, response: Response, next: NextFunction): Promise<Response>{
    const status = await this.getOrderStatusUseCase.handle(request.params.order_id);
    return response.status(200).json({ status });
  }

  public async updateStatus(request: Request, response: Response, next: NextFunction): Promise<Response>{
    const order = await this.updateOrderStatusUseCase.handle({
      id: request.params.order_id, 
      status: request.body.status as string
    });

    return response.status(200).json(order);
  }

  public async index(request: Request, response: Response, next: NextFunction): Promise<Response>{
    const orders = await this.listOrderUseCase.handle({
      category: request.query.category as string | undefined
    });

    return response.status(200).json(orders);
  }

  public async create(request: Request, response: Response, next: NextFunction): Promise<Response>{
    const orderResponse = await this.createOrderUseCase.handle({
      client_cpf: request.body.client_cpf,
      restaurant_id: request.body.restaurant_id,
      foods: request.body.foods
    });

    return response.status(201).json(orderResponse);
  }
}