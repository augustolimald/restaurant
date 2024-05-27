import { Request, Response, NextFunction, Router } from 'express';

export interface Controller {
	routes(): Router;

	get?(request: Request, response: Response, next: NextFunction): Promise<Response>;
	index?(request: Request, response: Response, next: NextFunction): Promise<Response>;
	create?(request: Request, response: Response, next: NextFunction): Promise<Response>;
	update?(request: Request, response: Response, next: NextFunction): Promise<Response>;
	delete?(request: Request, response: Response, next: NextFunction): Promise<Response>;
}