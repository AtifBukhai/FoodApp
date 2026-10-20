import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify restaurant exists and is open
      const restaurant = await tx.restaurant.findUnique({
        where: { id: dto.restaurantId, deletedAt: null },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      if (!restaurant.isOpen) {
        throw new BadRequestException('Restaurant is currently closed');
      }

      if (!restaurant.isApproved) {
        throw new BadRequestException('Restaurant is not approved');
      }

      // 2. Verify address belongs to user
      const address = await tx.address.findUnique({
        where: { id: dto.deliveryAddressId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      if (address.userId !== userId) {
        throw new ForbiddenException('Address does not belong to user');
      }

      // 3. Fetch menu items and calculate totals from database prices
      const menuItemIds = dto.items.map(item => item.menuItemId);
      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: menuItemIds } },
      });

      if (menuItems.length !== menuItemIds.length) {
        throw new BadRequestException('Some menu items not found');
      }

      // Check availability
      const unavailableItems = menuItems.filter(item => !item.isAvailable);
      if (unavailableItems.length > 0) {
        throw new BadRequestException(
          `Items not available: ${unavailableItems.map(i => i.name).join(', ')}`,
        );
      }

      // 4. Calculate totals (all in paisa)
      let subtotal = 0;
      const orderItems = dto.items.map(dtoItem => {
        const menuItem = menuItems.find(m => m.id === dtoItem.menuItemId);
        if (!menuItem) {
          throw new BadRequestException(`Menu item ${dtoItem.menuItemId} not found`);
        }

        const unitPrice = menuItem.price; // Already in paisa
        const itemTotal = unitPrice * dtoItem.quantity;
        subtotal += itemTotal;

        return {
          menuItemId: dtoItem.menuItemId,
          quantity: dtoItem.quantity,
          unitPrice,
          notes: dtoItem.notes,
          modifiers: dtoItem.modifiers || [],
        };
      });

      // Check minimum order
      if (subtotal < restaurant.minOrder) {
        throw new BadRequestException(
          `Minimum order amount is PKR ${restaurant.minOrder / 100}`,
        );
      }

      const deliveryFee = restaurant.deliveryFee; // Already in paisa
      const tax = Math.round(subtotal * 0.05); // 5% GST
      const discount = 0; // TODO: Implement coupon system
      const total = subtotal + deliveryFee + tax - discount;

      // 5. Generate order number
      const orderNumber = `KD-${Date.now().toString(36).toUpperCase()}`;

      // 6. Create order with items in transaction
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          restaurantId: dto.restaurantId,
          addressId: dto.deliveryAddressId,
          subtotal,
          deliveryFee,
          tax,
          discount,
          total,
          paymentMethod: dto.paymentMethod === 'cod' ? PaymentMethod.COD : PaymentMethod.ONLINE,
          paymentStatus: PaymentStatus.PENDING,
          status: OrderStatus.PENDING,
          estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000), // 35 minutes from now
          items: {
            create: orderItems,
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              message: 'Order placed',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
          restaurant: {
            select: {
              name: true,
            },
          },
          address: true,
        },
      });

      this.logger.log(`Order created: ${order.orderNumber} by user ${userId}`);

      // 7. Convert paisa to PKR for response
      return this.formatOrderResponse(order);
    });
  }

  async findAllByUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                nameUrdu: true,
              },
            },
          },
        },
        restaurant: {
          select: {
            name: true,
            nameUrdu: true,
          },
        },
        address: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return orders.map(order => this.formatOrderResponse(order));
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                nameUrdu: true,
                imageUrl: true,
              },
            },
          },
        },
        restaurant: {
          select: {
            name: true,
            nameUrdu: true,
          },
        },
        address: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.formatOrderResponse(order);
  }

  async cancel(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException('You do not have access to this order');
      }

      // Can only cancel if status is PENDING or CONFIRMED
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException('Order cannot be cancelled at this stage');
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          statusHistory: {
            create: {
              status: OrderStatus.CANCELLED,
              message: 'Order cancelled by customer',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
          restaurant: {
            select: {
              name: true,
            },
          },
          address: true,
        },
      });

      this.logger.log(`Order cancelled: ${order.orderNumber}`);

      return this.formatOrderResponse(updatedOrder);
    });
  }

  private formatOrderResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurant.name,
      items: order.items.map((item: any) => ({
        menuItem: {
          id: item.menuItemId,
          name: item.menuItem?.name || 'Unknown',
          nameUrdu: item.menuItem?.nameUrdu,
          price: item.unitPrice / 100,
        },
        quantity: item.quantity,
        selectedModifiers: item.modifiers || [],
        notes: item.notes || '',
      })),
      subtotal: order.subtotal / 100,
      deliveryFee: order.deliveryFee / 100,
      tax: order.tax / 100,
      discount: order.discount / 100,
      total: order.total / 100,
      status: order.status.toLowerCase(),
      paymentMethod: order.paymentMethod.toLowerCase(),
      deliveryAddress: {
        id: order.address.id,
        label: order.address.label,
        street: order.address.street,
        area: order.address.area,
        city: order.address.city,
        isDefault: order.address.isDefault,
      },
      createdAt: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      trackingEvents: order.statusHistory.map((event: any) => ({
        status: event.status.toLowerCase(),
        timestamp: event.createdAt.toISOString(),
        message: event.message,
      })),
    };
  }
}
