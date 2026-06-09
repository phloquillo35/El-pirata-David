import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CartItemResponse {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
  maxStock: number;
}

export interface CartResponse {
  userId: string;
  items: CartItemResponse[];
  subtotal: number;
  totalItems: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponse> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { order: 'asc' } },
                },
              },
            },
          },
        },
      });
    }

    const items: CartItemResponse[] = cart.items
      .filter((item) => item.product !== null)
      .map((item) => ({
        productId: item.productId,
        name: item.product!.name,
        sku: item.product!.sku,
        price: Number(item.product!.price),
        quantity: item.quantity,
        image: item.product!.images[0]?.url || null,
        maxStock: item.product!.stock,
      }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return { userId, items, subtotal, totalItems };
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<CartResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
    }

    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const existingItem = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      const newQty = existingItem ? existingItem.quantity + quantity : quantity;

      if (newQty > product.stock) {
        throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
      }

      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity },
        update: { quantity: newQty },
      });
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<CartResponse> {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: item.id },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }
}
