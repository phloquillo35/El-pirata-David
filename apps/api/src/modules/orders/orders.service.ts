import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, OrderStatus, OrderType } from '@prisma/client';
import { CreateOrderDTO, UpdateOrderStatusDTO } from './dto/order.dto';

const orderListInclude = {
  items: true,
  payments: true,
};

const orderDetailInclude = {
  items: true,
  payments: true,
  tracking: { orderBy: { createdAt: 'asc' as const } },
  shippingAddress: true,
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    filters: { status?: OrderStatus; type?: OrderType; page?: number; limit?: number },
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderListInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(
    filters: { status?: OrderStatus; type?: OrderType; page?: number; limit?: number },
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderListInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findById(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: orderDetailInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async create(userId: string, data: CreateOrderDTO) {
    const { items, shippingAddressId, notes } = data;

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
    });

    if (products.length !== new Set(productIds).size) {
      throw new NotFoundException('One or more products not found or inactive');
    }

    const orderItemsData: Array<{
      productId: string;
      name: string;
      sku: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
      image: string | null;
    }> = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const unitPrice = new Prisma.Decimal(product.price.toString());
      const quantity = new Prisma.Decimal(item.quantity);
      const totalPrice = unitPrice.times(quantity);

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        image: product.images[0]?.url || null,
      });
    }

    const subtotal = orderItemsData.reduce(
      (sum, item) => sum.plus(item.totalPrice),
      new Prisma.Decimal(0),
    );
    const shippingCost = subtotal.lessThan(500000) ? new Prisma.Decimal(15000) : new Prisma.Decimal(0);
    const tax = subtotal.times(0.1);
    const total = subtotal.plus(shippingCost).plus(tax);
    const orderNumber = 'EPD-' + Date.now().toString(36).toUpperCase();

    return this.prisma.$transaction(async (tx) => {
      for (const item of orderItemsData) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new BadRequestException(`Insufficient stock for product ${item.name}`);
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          type: OrderType.STOCK,
          subtotal,
          shippingCost,
          tax,
          total,
          notes: notes || null,
          shippingAddressId: shippingAddressId || null,
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              name: item.name,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              image: item.image,
            })),
          },
          tracking: {
            create: {
              status: OrderStatus.PENDING,
              description: 'Order created',
            },
          },
        },
        include: orderDetailInclude,
      });

      return order;
    });
  }

  async updateStatus(id: string, status: OrderStatus, description: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        tracking: {
          create: {
            status,
            description,
          },
        },
      },
      include: orderDetailInclude,
    });
  }

  async cancelOrder(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Only pending or confirmed orders can be cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          tracking: {
            create: {
              status: OrderStatus.CANCELLED,
              description: 'Order cancelled by user',
            },
          },
        },
        include: orderDetailInclude,
      });
    });
  }

  async getTracking(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.orderTracking.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' },
    });
  }
}
