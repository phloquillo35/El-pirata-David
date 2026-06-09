import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      pendingOrders,
      allActiveProducts,
      recentOrders,
      ordersByStatus,
      recentOrdersForRevenue,
      recentAIRequests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          status: { not: OrderStatus.CANCELLED },
        },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.aIRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, lastName: true, email: true },
          },
        },
      }),
    ]);

    const lowStockProducts = allActiveProducts
      .filter(p => p.stock <= p.minStock)
      .slice(0, 10);

    const monthlyRevenueMap = new Map<string, { revenue: number; orderCount: number }>();

    for (const order of recentOrdersForRevenue) {
      const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
      if (!monthlyRevenueMap.has(key)) {
        monthlyRevenueMap.set(key, { revenue: 0, orderCount: 0 });
      }
      const entry = monthlyRevenueMap.get(key)!;
      entry.revenue += Number(order.total);
      entry.orderCount += 1;
    }

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const entry = monthlyRevenueMap.get(key);
      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        revenue: entry?.revenue || 0,
        orderCount: entry?.orderCount || 0,
      });
    }

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.total || 0),
      pendingOrders,
      lowStockProducts,
      recentOrders,
      ordersByStatus: ordersByStatus.map(g => ({
        status: g.status,
        count: g._count.id,
      })),
      monthlyRevenue,
      recentAIRequests,
    };
  }

  async getSalesReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED },
      },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const salesByDayMap = new Map<string, { date: string; revenue: number; orders: number }>();
    const salesByPaymentMethodMap = new Map<string, { method: string; revenue: number; orders: number }>();
    const productSalesMap = new Map<string, { productId: string; name: string; sku: string; quantity: number; revenue: number }>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];

      if (!salesByDayMap.has(dateKey)) {
        salesByDayMap.set(dateKey, { date: dateKey, revenue: 0, orders: 0 });
      }
      const dayEntry = salesByDayMap.get(dateKey)!;
      dayEntry.revenue += Number(order.total);
      dayEntry.orders += 1;

      for (const payment of order.payments) {
        if (!salesByPaymentMethodMap.has(payment.method)) {
          salesByPaymentMethodMap.set(payment.method, { method: payment.method, revenue: 0, orders: 0 });
        }
        const pmEntry = salesByPaymentMethodMap.get(payment.method)!;
        pmEntry.revenue += Number(payment.amount);
        pmEntry.orders += 1;
      }

      for (const item of order.items) {
        if (!item.productId) continue;
        if (!productSalesMap.has(item.productId)) {
          productSalesMap.set(item.productId, {
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            quantity: 0,
            revenue: 0,
          });
        }
        const prodEntry = productSalesMap.get(item.productId)!;
        prodEntry.quantity += item.quantity;
        prodEntry.revenue += Number(item.totalPrice);
      }
    }

    return {
      summary: {
        totalSales: totalOrders,
        totalRevenue,
        averageOrderValue,
      },
      salesByDay: Array.from(salesByDayMap.values()),
      salesByPaymentMethod: Array.from(salesByPaymentMethodMap.values()),
      topSellingProducts: Array.from(productSalesMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 20),
    };
  }

  async getProductsReport() {
    const [productsByCategory, allProducts] = await Promise.all([
      this.prisma.product.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
      this.prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: { select: { id: true, name: true } },
        },
      }),
    ]);

    const categoryIds = productsByCategory.map(g => g.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const totalByCategory = productsByCategory.map(g => ({
      categoryId: g.categoryId,
      categoryName: categoryMap.get(g.categoryId) || 'Unknown',
      count: g._count.id,
    }));

    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);

    const productsWithOrders = await this.prisma.orderItem.findMany({
      where: { productId: { not: null } },
      select: { productId: true },
      distinct: ['productId'],
    });
    const productIdsWithOrders = new Set(productsWithOrders.map(p => p.productId));
    const productsWithNoSales = allProducts.filter(p => !productIdsWithOrders.has(p.id));

    return {
      totalByCategory,
      lowStockProducts,
      productsWithNoSales,
    };
  }

  async getUsersReport() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [usersByRole, newUsersThisMonth, usersWithMostOrders] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.order.groupBy({
        by: ['userId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const userIds = usersWithMostOrders.map(g => g.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, lastName: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return {
      totalByRole: usersByRole.map(g => ({
        role: g.role,
        count: g._count.id,
      })),
      newUsersThisMonth,
      usersWithMostOrders: usersWithMostOrders.map(g => ({
        user: userMap.get(g.userId) || null,
        orderCount: g._count.id,
      })),
    };
  }
}
