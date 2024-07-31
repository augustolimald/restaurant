import { Client, Order } from '../../core/entities';

export interface QrCodeResponse {
	qrCodeData: string;
}

export interface PaymentGateway {
  generateQrCodeForOrder(order: Order): Promise<QrCodeResponse>;
}