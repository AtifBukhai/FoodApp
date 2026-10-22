import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/restaurant.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class RestaurantPartnersService {
  private readonly logger = new Logger(RestaurantPartnersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new restaurant
   */
  async createRestaurant(userId: string, dto: CreateRestaurantDto) {
    // Verify user has RESTAURANT_OWNER role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.RESTAURANT_OWNER) {
      throw new ForbiddenException('Only restaurant owners can create restaurants');
    }

    // Create restaurant
    const restaurant = await this.prisma.restaurant.create({
      data: {
        ...dto,
        ownerId: userId,
        rating: 0,
        reviewCount: 0,
        isOpen: false,
        isApproved: false,
        isFeatured: false,
      },
    });

    this.logger.log(`Restaurant created: ${restaurant.id} by owner ${userId}`);

    return restaurant;
  }

  /**
   * Get all restaurants owned by the user
   */
  async getMyRestaurants(userId: string) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return restaurants;
  }

  /**
   * Get a specific restaurant with ownership verification
   */
  async getRestaurant(userId: string, restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId, deletedAt: null },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Verify ownership
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return restaurant;
  }

  /**
   * Update restaurant details
   */
  async updateRestaurant(userId: string, restaurantId: string, dto: UpdateRestaurantDto) {
    // Verify ownership first
    await this.getRestaurant(userId, restaurantId);

    const restaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: dto,
    });

    this.logger.log(`Restaurant updated: ${restaurantId} by owner ${userId}`);

    return restaurant;
  }

  /**
   * Soft delete a restaurant
   */
  async deleteRestaurant(userId: string, restaurantId: string) {
    // Verify ownership first
    await this.getRestaurant(userId, restaurantId);

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Restaurant deleted: ${restaurantId} by owner ${userId}`);

    return { message: 'Restaurant deleted successfully' };
  }

  /**
   * Get orders for all restaurants owned by the user
   */
  async getMyOrders(userId: string, status?: string) {
    // Get all restaurant IDs owned by this user
    const myRestaurants = await this.prisma.restaurant.findMany({
      where: { ownerId: userId, deletedAt: null },
      select: { id: true },
    });

    const restaurantIds = myRestaurants.map((r) => r.id);

    if (restaurantIds.length === 0) {
      return [];
    }

    // Build where clause
    const where: any = {
      restaurantId: { in: restaurantIds },
    };

    if (status) {
      where.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  /**
   * Accept an order
   */
  async acceptOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Verify order can be accepted
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order cannot be accepted in current status');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        statusHistory: {
          create: {
            status: 'CONFIRMED',
            message: 'Order accepted by restaurant',
          },
        },
      },
    });

    this.logger.log(`Order accepted: ${orderId} by restaurant owner ${userId}`);

    return updatedOrder;
  }

  /**
   * Reject an order
   */
  async rejectOrder(userId: string, orderId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Verify order can be rejected
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order cannot be rejected in current status');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        statusHistory: {
          create: {
            status: 'CANCELLED',
            message: reason || 'Order rejected by restaurant',
          },
        },
      },
    });

    this.logger.log(`Order rejected: ${orderId} by restaurant owner ${userId}`);

    return updatedOrder;
  }

  /**
   * Update order status to preparing
   */
  async markAsPreparing(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Verify order can be marked as preparing
    if (order.status !== 'CONFIRMED') {
      throw new BadRequestException('Order must be confirmed before preparing');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PREPARING',
        statusHistory: {
          create: {
            status: 'PREPARING',
            message: 'Order is being prepared',
          },
        },
      },
    });

    this.logger.log(`Order marked as preparing: ${orderId}`);

    return updatedOrder;
  }

  /**
   * Mark order as ready for pickup
   */
  async markAsReady(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (order.restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Verify order can be marked as ready
    if (order.status !== 'PREPARING') {
      throw new BadRequestException('Order must be preparing before ready');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'READY_FOR_PICKUP',
        statusHistory: {
          create: {
            status: 'READY_FOR_PICKUP',
            message: 'Order ready for rider pickup',
          },
        },
      },
    });

    this.logger.log(`Order marked as ready: ${orderId}`);

    return updatedOrder;
  }

  /**
   * Get analytics for all restaurants owned by the user
   */
  async getAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    // Get all restaurant IDs owned by this user
    const myRestaurants = await this.prisma.restaurant.findMany({
      where: { ownerId: userId, deletedAt: null },
      select: { id: true },
    });

    const restaurantIds = myRestaurants.map((r) => r.id);

    if (restaurantIds.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
      };
    }

    // Build where clause for orders
    const where: any = {
      restaurantId: { in: restaurantIds },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get all orders
    const orders = await this.prisma.order.findMany({
      where,
      select: {
        total: true,
        status: true,
      },
    });

    // Calculate analytics
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }
}
