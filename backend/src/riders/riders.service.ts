import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateRiderProfileDto,
  UpdateAvailabilityDto,
  UpdateLocationDto,
  AcceptDeliveryDto,
  DeclineDeliveryDto,
  ConfirmPickupDto,
  ConfirmDeliveryDto,
} from './dto/rider.dto';
import { UserRole, DeliveryStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class RidersService {
  private readonly logger = new Logger(RidersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get rider profile
   */
  async getProfile(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    return rider;
  }

  /**
   * Update rider profile
   */
  async updateProfile(userId: string, dto: UpdateRiderProfileDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { userId },
      data: dto,
    });

    this.logger.log(`Rider profile updated: ${userId}`);

    return updatedRider;
  }

  /**
   * Update rider availability
   */
  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    if (!rider.isApproved) {
      throw new BadRequestException('Rider must be approved before going online');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { userId },
      data: { isAvailable: dto.isAvailable },
    });

    this.logger.log(`Rider availability updated: ${userId} - ${dto.isAvailable}`);

    return updatedRider;
  }

  /**
   * Update rider location
   */
  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { userId },
      data: {
        currentLat: dto.latitude,
        currentLng: dto.longitude,
        lastLocationUpdate: new Date(),
      },
    });

    return updatedRider;
  }

  /**
   * Get available delivery offers for rider
   */
  async getAvailableDeliveries(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    if (!rider.isApproved) {
      throw new BadRequestException('Rider must be approved to see deliveries');
    }

    // Find orders that are READY_FOR_PICKUP and don't have a delivery yet
    const availableOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.READY_FOR_PICKUP,
        delivery: null,
        restaurant: {
          isOpen: true,
          isApproved: true,
        },
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            city: true,
            area: true,
          },
        },
        address: {
          select: {
            street: true,
            area: true,
            city: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transform to delivery offers
    return availableOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      restaurant: order.restaurant,
      deliveryAddress: order.address,
      itemCount: order.items.length,
      totalAmount: order.total,
      deliveryFee: order.deliveryFee,
      createdAt: order.createdAt,
    }));
  }

  /**
   * Accept a delivery
   */
  async acceptDelivery(userId: string, orderId: string, dto?: AcceptDeliveryDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verify rider exists and is approved
      const rider = await tx.rider.findUnique({
        where: { userId },
      });

      if (!rider) {
        throw new NotFoundException('Rider profile not found');
      }

      if (!rider.isApproved) {
        throw new BadRequestException('Rider must be approved to accept deliveries');
      }

      if (!rider.isAvailable) {
        throw new BadRequestException('Rider must be online to accept deliveries');
      }

      // Check if rider already has an active delivery
      const activeDelivery = await tx.delivery.findFirst({
        where: {
          riderId: rider.id,
          status: {
            in: [DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED, DeliveryStatus.PICKED_UP],
          },
        },
      });

      if (activeDelivery) {
        throw new BadRequestException('Rider already has an active delivery');
      }

      // Verify order exists and is ready for pickup
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          delivery: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.READY_FOR_PICKUP) {
        throw new BadRequestException('Order is not ready for pickup');
      }

      if (order.delivery) {
        throw new ConflictException('Delivery already assigned to this order');
      }

      // Create delivery record
      const delivery = await tx.delivery.create({
        data: {
          orderId: order.id,
          riderId: rider.id,
          status: DeliveryStatus.ACCEPTED,
          assignedAt: new Date(),
          acceptedAt: new Date(),
          baseFee: order.deliveryFee,
          pickupNotes: dto?.notes,
        },
      });

      // Update order status to PICKED_UP (will be updated to PICKED_UP when rider confirms pickup)
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PICKED_UP,
          statusHistory: {
            create: {
              status: OrderStatus.PICKED_UP,
              message: `Rider accepted delivery`,
            },
          },
        },
      });

      this.logger.log(`Delivery accepted: ${orderId} by rider ${userId}`);

      return delivery;
    });
  }

  /**
   * Decline a delivery
   */
  async declineDelivery(userId: string, orderId: string, dto?: DeclineDeliveryDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    // Just log the decline - order remains available for other riders
    this.logger.log(
      `Delivery declined: ${orderId} by rider ${userId}. Reason: ${dto?.reason || 'Not specified'}`,
    );

    return { message: 'Delivery declined' };
  }

  /**
   * Get active deliveries for rider
   */
  async getActiveDeliveries(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        status: {
          in: [DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED, DeliveryStatus.PICKED_UP],
        },
      },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                name: true,
                address: true,
                city: true,
                area: true,
                phone: true,
              },
            },
            address: {
              select: {
                street: true,
                area: true,
                city: true,
                label: true,
              },
            },
            items: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return deliveries;
  }

  /**
   * Get completed deliveries for rider
   */
  async getCompletedDeliveries(userId: string, limit: number = 20) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        status: DeliveryStatus.DELIVERED,
      },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                name: true,
              },
            },
            address: {
              select: {
                street: true,
                area: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        deliveredAt: 'desc',
      },
      take: limit,
    });

    return deliveries;
  }

  /**
   * Confirm pickup
   */
  async confirmPickup(userId: string, deliveryId: string, dto?: ConfirmPickupDto) {
    return this.prisma.$transaction(async (tx) => {
      const rider = await tx.rider.findUnique({
        where: { userId },
      });

      if (!rider) {
        throw new NotFoundException('Rider profile not found');
      }

      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          order: true,
        },
      });

      if (!delivery) {
        throw new NotFoundException('Delivery not found');
      }

      if (delivery.riderId !== rider.id) {
        throw new ForbiddenException('You are not assigned to this delivery');
      }

      if (delivery.status !== DeliveryStatus.ACCEPTED) {
        throw new BadRequestException('Delivery must be accepted before pickup');
      }

      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.PICKED_UP,
          pickedUpAt: new Date(),
          pickupNotes: dto?.notes || delivery.pickupNotes,
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: OrderStatus.PICKED_UP,
          statusHistory: {
            create: {
              status: OrderStatus.PICKED_UP,
              message: `Rider picked up order`,
            },
          },
        },
      });

      this.logger.log(`Pickup confirmed: ${deliveryId} by rider ${userId}`);

      return updatedDelivery;
    });
  }

  /**
   * Confirm delivery
   */
  async confirmDelivery(userId: string, deliveryId: string, dto?: ConfirmDeliveryDto) {
    return this.prisma.$transaction(async (tx) => {
      const rider = await tx.rider.findUnique({
        where: { userId },
      });

      if (!rider) {
        throw new NotFoundException('Rider profile not found');
      }

      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          order: true,
        },
      });

      if (!delivery) {
        throw new NotFoundException('Delivery not found');
      }

      if (delivery.riderId !== rider.id) {
        throw new ForbiddenException('You are not assigned to this delivery');
      }

      if (delivery.status !== DeliveryStatus.PICKED_UP) {
        throw new BadRequestException('Order must be picked up before delivery');
      }

      const tip = dto?.tip || 0;
      const totalEarnings = delivery.baseFee + tip;

      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
          tip: tip,
          totalEarnings: totalEarnings,
          deliveryNotes: dto?.notes || delivery.deliveryNotes,
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: OrderStatus.DELIVERED,
          statusHistory: {
            create: {
              status: OrderStatus.DELIVERED,
              message: `Order delivered by rider`,
            },
          },
        },
      });

      // Update rider stats
      await tx.rider.update({
        where: { id: rider.id },
        data: {
          totalDeliveries: {
            increment: 1,
          },
        },
      });

      this.logger.log(`Delivery completed: ${deliveryId} by rider ${userId}`);

      return updatedDelivery;
    });
  }

  /**
   * Get earnings summary
   */
  async getEarnings(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    // Get all completed deliveries
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        status: DeliveryStatus.DELIVERED,
      },
      select: {
        baseFee: true,
        tip: true,
        totalEarnings: true,
        deliveredAt: true,
      },
    });

    // Calculate totals
    const totalEarnings = deliveries.reduce((sum, d) => sum + d.totalEarnings, 0);
    const totalBaseFees = deliveries.reduce((sum, d) => sum + d.baseFee, 0);
    const totalTips = deliveries.reduce((sum, d) => sum + d.tip, 0);

    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDeliveries = deliveries.filter((d) => d.deliveredAt && d.deliveredAt >= today);
    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.totalEarnings, 0);

    // Calculate this week's earnings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekDeliveries = deliveries.filter((d) => d.deliveredAt && d.deliveredAt >= weekAgo);
    const weekEarnings = weekDeliveries.reduce((sum, d) => sum + d.totalEarnings, 0);

    return {
      totalEarnings,
      totalBaseFees,
      totalTips,
      todayEarnings,
      weekEarnings,
      totalDeliveries: deliveries.length,
    };
  }

  /**
   * Get delivery history with earnings
   */
  async getEarningsHistory(userId: string, limit: number = 50) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });

    if (!rider) {
      throw new NotFoundException('Rider profile not found');
    }

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        riderId: rider.id,
        status: DeliveryStatus.DELIVERED,
      },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                name: true,
              },
            },
            address: {
              select: {
                street: true,
                area: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        deliveredAt: 'desc',
      },
      take: limit,
    });

    return deliveries;
  }
}
