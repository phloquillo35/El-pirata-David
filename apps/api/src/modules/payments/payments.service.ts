import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createMercadoPagoPreference(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const items = order.items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      currency_id: 'ARS',
    }));

    try {
      const preference = await this.createPreference({
        items,
        external_reference: order.id,
        back_urls: {
          success: this.configService.get<string>('MERCADO_PAGO_SUCCESS_URL', 'https://eldavopirata.com/checkout/success'),
          failure: this.configService.get<string>('MERCADO_PAGO_FAILURE_URL', 'https://eldavopirata.com/checkout/failure'),
          pending: this.configService.get<string>('MERCADO_PAGO_PENDING_URL', 'https://eldavopirata.com/checkout/pending'),
        },
        auto_return: 'approved',
        notification_url: this.configService.get<string>('MERCADO_PAGO_WEBHOOK_URL', 'https://api.eldavopirata.com/payments/webhook'),
        statement_descriptor: 'EL PIRATA DAVID',
      });

      return {
        preferenceId: preference.id,
        initPoint: preference.init_point,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create MercadoPago preference');
    }
  }

  async processMercadoPagoWebhook(data: any) {
    const topic = data.topic || data.type;
    const paymentId = data.data?.id || data.id;

    if (!topic || !paymentId) {
      throw new BadRequestException('Invalid webhook data');
    }

    try {
      const paymentData = await this.getMercadoPagoPayment(paymentId);

      const externalReference = paymentData.external_reference;
      const status = paymentData.status;
      const payerEmail = paymentData.payer?.email;

      if (!externalReference) {
        throw new BadRequestException('Payment has no external reference');
      }

      const paymentStatusMap: Record<string, PaymentStatus> = {
        approved: PaymentStatus.APPROVED,
        pending: PaymentStatus.PENDING,
        rejected: PaymentStatus.REJECTED,
        refunded: PaymentStatus.REFUNDED,
        cancelled: PaymentStatus.CANCELLED,
        in_process: PaymentStatus.PENDING,
      };

      const mappedStatus = paymentStatusMap[status] || PaymentStatus.PENDING;

      const existingPayment = await this.prisma.payment.findFirst({
        where: { transactionId: paymentId },
      });

      if (existingPayment) {
        return this.prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: mappedStatus,
            payerEmail: payerEmail || existingPayment.payerEmail,
            metadata: paymentData,
          },
        });
      }

      const order = await this.prisma.order.findUnique({
        where: { id: externalReference },
      });

      if (!order) {
        throw new NotFoundException('Order not found for external reference');
      }

      const payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.MERCADO_PAGO,
          status: mappedStatus,
          amount: order.total,
          currency: order.currency,
          transactionId: paymentId,
          payerEmail: payerEmail || null,
          metadata: paymentData,
        },
      });

      if (mappedStatus === PaymentStatus.APPROVED) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            tracking: {
              create: {
                status: OrderStatus.CONFIRMED,
                description: 'Payment approved via MercadoPago',
              },
            },
          },
        });
      }

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process MercadoPago webhook');
    }
  }

  async createBankTransfer(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const referenceNumber = `BT-${Date.now().toString(36).toUpperCase()}-${order.orderNumber}`;

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PENDING,
        amount: order.total,
        currency: order.currency,
        transactionId: referenceNumber,
      },
    });

    return {
      referenceNumber,
      amount: order.total,
      currency: order.currency,
      bankName: this.configService.get<string>('BANK_NAME', 'Banco Itaú'),
      accountHolder: this.configService.get<string>('BANK_ACCOUNT_HOLDER', 'El Pirata David S.A.'),
      accountNumber: this.configService.get<string>('BANK_ACCOUNT_NUMBER', '0000-0000-0000-0000'),
      accountType: this.configService.get<string>('BANK_ACCOUNT_TYPE', 'Cuenta Corriente'),
      rut: this.configService.get<string>('BANK_RUT', '80000000-0'),
      email: this.configService.get<string>('BANK_EMAIL', 'pagos@eldavopirata.com'),
      instructions: 'Please transfer the exact amount and send the receipt to pagos@eldavopirata.com with your reference number.',
    };
  }

  async confirmBankTransfer(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException('Payment is not a bank transfer');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in PENDING status');
    }

    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.APPROVED },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          tracking: {
            create: {
              status: OrderStatus.CONFIRMED,
              description: 'Bank transfer confirmed by admin',
            },
          },
        },
      }),
    ]);

    return updatedPayment;
  }

  async getPaymentByOrder(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return payment;
  }

  private async createPreference(preferenceData: any): Promise<any> {
    const { MercadoPagoConfig, Preference } = await import('mercadopago');

    const client = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN', ''),
    });

    const preference = new Preference(client);

    const result = await preference.create({ body: preferenceData });

    return {
      id: result.id,
      init_point: result.init_point || result.sandbox_init_point,
    };
  }

  private async getMercadoPagoPayment(paymentId: string): Promise<any> {
    const { MercadoPagoConfig, Payment } = await import('mercadopago');

    const client = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN', ''),
    });

    const paymentClient = new Payment(client);

    const result = await paymentClient.get({ id: paymentId });

    return result;
  }
}
