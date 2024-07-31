import { Service } from 'typedi';

import { PaymentGateway, QrCodeResponse } from '../PaymentGateway';
import { Order } from '../../../core/entities';
import axios from 'axios';

@Service({ id: 'mercadopago' })
export class MercadoPagoGateway implements PaymentGateway {

  private apiUrl: string;

  private mercadoPagoUrl: string;

  private mercadoPagoUser: string;

  private mercadoPagoPos: string;

  private mercadoPagoToken: string;

  constructor() {
    this.apiUrl = process.env.API_URL;
    this.mercadoPagoUrl = process.env.MERCADOPAGO_URL;
    this.mercadoPagoUser = process.env.MERCADOPAGO_USER;
    this.mercadoPagoPos = process.env.MERCADOPAGO_POS;
    this.mercadoPagoToken = process.env.MERCADOPAGO_SECRET_TOKEN;
  }

  async generateQrCodeForOrder(order: Order): Promise<QrCodeResponse> {
    const url = `${this.mercadoPagoUrl}/instore/orders/qr/seller/collectors/${this.mercadoPagoUser}/pos/${this.mercadoPagoPos}/qrs`;

    const body = {
      title: `Pedido no Restaurant ${order.restaurant.name}`,
      description: 'a',
      total_amount: order.totalPrice,
      external_reference: order.id,
      notification_url: `${this.apiUrl}/mercadopago/qrcode`,
      sponsor: {
        id: this.mercadoPagoPos
      },
    };

    const headers = {
      Authorization: `Bearer ${this.mercadoPagoToken}`,
    };

    const response = await axios({
      url,
      method: 'POST',
      data: body,
      headers,
      validateStatus: data => true,
    });

    if (response.status % 100 !== 2) {
      console.log(response.data);
      return { qrCodeData: "test-qr-code" };
    }

    return {
      qrCodeData: response.data.qr_data
    };
  }
  
}