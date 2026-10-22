import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChangeUserRoleDto,
  SuspendUserDto,
  ApproveRestaurantDto,
  RejectRestaurantDto,
  ApproveRiderDto,
  RejectRiderDto,
  UpdateOrderStatusDto,
  UpdatePlatformConfigDto,
  DashboardMetricsDto,
} from './dto/admin.dto';
import { UserRole, OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    // User metrics
    const totalCustomers = await this.prisma.user.count({
      where: { role: UserRole.CUSTOMER, deletedAt: null },
    });

    const activeCustomers = await this.prisma.user.count({
      where: { role: UserRole.CUSTOMER, isActive: true, deletedAt: null },
    });

    const suspendedCustomers = totalCustomers - activeCustomers;

    // Restaurant metrics
    const totalRestaurants = await this.prisma.restaurant.count({
      where: { deletedAt: null },
    });

    const activeRestaurants = await this.prisma.restaurant.count({
      where: { isApproved: true, isOpen: true, deletedAt: null },
    });

    const pendingRestaurantApprovals = await this.prisma.restaurant.count({
      where: { isApproved: false, deletedAt: null },
    });

    const suspendedRestaurants = await this.prisma.restaurant.count({
      where: { isOpen: false, deletedAt: null },
    });

    // Rider metrics
    const totalRiders = await this.prisma.rider.count({
      where: { deletedAt: null },
    });

    const approvedRiders = await this.prisma.rider.count({
      where: { isApproved: true, deletedAt: null },
    });

    const pendingRiderApprovals = await this.prisma.rider.count({
      where: { isApproved: false, deletedAt: null },
    });

    const availableRiders = await this.prisma.rider.count({
      where: { isApproved: true, isAvailable: true, deletedAt: null },
    });

    // Order metrics
    const activeOrders = await this.prisma.order.count({
      where: {
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        },
      },
    });

    const completedOrders = await this.prisma.order.count({
      where: { status: OrderStatus.DELIVERED },
    });

    const cancelledOrders = await this.prisma.order.count({
      where: { status: OrderStatus.CANCELLED },
    });

    // Financial metrics
    const allOrders = await this.prisma.order.findMany({
      select: {
        total: true,
        deliveryFee: true,
        status: true,
        paymentStatus: true,
      },
    });

    const grossOrderValue = allOrders.reduce((sum, o) => sum + o.total, 0);

    // Platform revenue: delivered orders with completed payment
    const deliveredPaidOrders = allOrders.filter(
      (o) => o.status === OrderStatus.DELIVERED && o.paymentStatus === PaymentStatus.COMPLETED,
    );

    const platformRevenue = deliveredPaidOrders.reduce((sum, o) => sum + o.total, 0);
    const deliveryFees = deliveredPaidOrders.reduce((sum, o) => sum + o.deliveryFee, 0);

    // Rider earnings from deliveries
    const deliveries = await this.prisma.delivery.findMany({
      where: { status: 'DELIVERED' },
      select: { totalEarnings: true },
    });

    const riderEarnings = deliveries.reduce((sum, d) => sum + d.totalEarnings, 0);
    const platformCommission = platformRevenue - deliveryFees - riderEarnings;

    // Payment metrics
    const pendingPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.PENDING },
    });

    const completedPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.COMPLETED },
    });

    const failedPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.FAILED },
    });

    return {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      totalRestaurants,
      activeRestaurants,
      pendingRestaurantApprovals,
      suspendedRestaurants,
      totalRiders,
      approvedRiders,
      pendingRiderApprovals,
      availableRiders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      grossOrderValue,
      platformRevenue,
      deliveryFees,
      riderEarnings,
      platformCommission,
      pendingPayments,
      completedPayments,
      failedPayments,
    };
  }

  /**
   * Get all users with filters
   */
  async getUsers(filters: { role?: UserRole; isActive?: boolean; search?: string }) {
    const where: any = { deletedAt: null };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Get user details
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        addresses: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Change user role
   */
  async changeUserRole(adminId: string, userId: string, dto: ChangeUserRoleDto) {
    // Prevent admin from changing their own role
    if (adminId === userId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent changing the last admin's role
    if (user.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, isActive: true, deletedAt: null },
      });

      if (adminCount === 1) {
        throw new ForbiddenException('Cannot change the role of the last active administrator');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
       { role: dto.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Log the action
    await this.createAuditLog(adminId, 'USER_ROLE_CHANGE', 'User', userId, {
      oldRole: user.role,
      newRole: dto.role,
    }, dto.reason);

    this.logger.log(`Admin ${adminId} changed user ${userId} role from ${user.role} to ${dto.role}`);

    return updatedUser;
  }

  /**
   * Suspend user
   */
  async suspendUser(adminId: string, userId: string, dto: SuspendUserDto) {
    // Prevent admin from suspending themselves
    if (adminId === userId) {
      throw new ForbiddenException('Cannot suspend your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent suspending the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, isActive: true, deletedAt: null },
      });

      if (adminCount === 1) {
        throw new ForbiddenException('Cannot suspend the last active administrator');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
       { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    // Log the action
    await this.createAuditLog(adminId, 'USER_SUSPEND', 'User', userId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} suspended user ${userId}`);

    return updatedUser;
  }

  /**
   * Activate user
   */
  async activateUser(adminId: string, userId: string, dto: SuspendUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
       { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    // Log the action
    await this.createAuditLog(adminId, 'USER_ACTIVATE', 'User', userId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} activated user ${userId}`);

    return updatedUser;
  }

  /**
   * Get all restaurants
   */
  async getRestaurants(filters: { isApproved?: boolean; isOpen?: boolean; search?: string }) {
    const where: any = { deletedAt: null };

    if (filters.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
    }

    if (filters.isOpen !== undefined) {
      where.isOpen = filters.isOpen;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return restaurants;
  }

  /**
   * Approve restaurant
   */
  async approveRestaurant(adminId: string, restaurantId: string, dto: ApproveRestaurantDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId, deletedAt: null },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Prevent restaurant owner from approving their own restaurant
    if (restaurant.ownerId === adminId) {
      throw new ForbiddenException('Cannot approve your own restaurant');
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
       { isApproved: true },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RESTAURANT_APPROVE', 'Restaurant', restaurantId, {}, dto.notes);

    this.logger.log(`Admin ${adminId} approved restaurant ${restaurantId}`);

    return updatedRestaurant;
  }

  /**
   * Reject restaurant
   */
  async rejectRestaurant(adminId: string, restaurantId: string, dto: RejectRestaurantDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId, deletedAt: null },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Prevent restaurant owner from rejecting their own restaurant
    if (restaurant.ownerId === adminId) {
      throw new ForbiddenException('Cannot reject your own restaurant');
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
       { isApproved: false },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RESTAURANT_REJECT', 'Restaurant', restaurantId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} rejected restaurant ${restaurantId}`);

    return updatedRestaurant;
  }

  /**
   * Suspend restaurant
   */
  async suspendRestaurant(adminId: string, restaurantId: string, dto: SuspendUserDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId, deletedAt: null },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
       { isOpen: false },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RESTAURANT_SUSPEND', 'Restaurant', restaurantId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} suspended restaurant ${restaurantId}`);

    return updatedRestaurant;
  }

  /**
   * Activate restaurant
   */
  async activateRestaurant(adminId: string, restaurantId: string, dto: SuspendUserDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId, deletedAt: null },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id: restaurantId },
       { isOpen: true },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RESTAURANT_ACTIVATE', 'Restaurant', restaurantId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} activated restaurant ${restaurantId}`);

    return updatedRestaurant;
  }

  /**
   * Get all riders
   */
  async getRiders(filters: { isApproved?: boolean; isAvailable?: boolean; search?: string }) {
    const where: any = { deletedAt: null };

    if (filters.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
    }

    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters.search) {
      where.user = {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } },
        ],
      };
    }

    const riders = await this.prisma.rider.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return riders;
  }

  /**
   * Approve rider
   */
  async approveRider(adminId: string, riderId: string, dto: ApproveRiderDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId, deletedAt: null },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { id: riderId },
       { isApproved: true },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RIDER_APPROVE', 'Rider', riderId, {}, dto.notes);

    this.logger.log(`Admin ${adminId} approved rider ${riderId}`);

    return updatedRider;
  }

  /**
   * Reject rider
   */
  async rejectRider(adminId: string, riderId: string, dto: RejectRiderDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId, deletedAt: null },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { id: riderId },
       { isApproved: false },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RIDER_REJECT', 'Rider', riderId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} rejected rider ${riderId}`);

    return updatedRider;
  }

  /**
   * Suspend rider
   */
  async suspendRider(adminId: string, riderId: string, dto: SuspendUserDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId, deletedAt: null },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    // Check if rider has active deliveries
    const activeDelivery = await this.prisma.delivery.findFirst({
      where: {
        riderId: riderId,
        status: {
          in: ['ACCEPTED', 'PICKED_UP'],
        },
      },
    });

    if (activeDelivery) {
      throw new BadRequestException('Cannot suspend rider with active deliveries');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { id: riderId },
       { isAvailable: false },
    });

    // Also suspend the user account
    await this.prisma.user.update({
      where: { id: rider.userId },
       { isActive: false },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RIDER_SUSPEND', 'Rider', riderId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} suspended rider ${riderId}`);

    return updatedRider;
  }

  /**
   * Activate rider
   */
  async activateRider(adminId: string, riderId: string, dto: SuspendUserDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId, deletedAt: null },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { id: riderId },
       { isAvailable: true },
    });

    // Also activate the user account
    await this.prisma.user.update({
      where: { id: rider.userId },
       { isActive: true },
    });

    // Log the action
    await this.createAuditLog(adminId, 'RIDER_ACTIVATE', 'Rider', riderId, {}, dto.reason);

    this.logger.log(`Admin ${adminId} activated rider ${riderId}`);

    return updatedRider;
  }

  /**
   * Get all orders
   */
  async getOrders(filters: {
    status?: string;
    paymentStatus?: string;
    restaurantId?: string;
    riderId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.restaurantId) {
      where.restaurantId = filters.restaurantId;
    }

    if (filters.riderId) {
      where.delivery = {
        riderId: filters.riderId,
      };
    }

    if (filters.search) {
      where.orderNumber = { contains: filters.search, mode: 'insensitive' };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        delivery: {
          select: {
            id: true,
            status: true,
            rider: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  /**
   * Update order status (admin intervention)
   */
  async updateOrderStatus(adminId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
       {
        status: dto.status as OrderStatus,
        statusHistory: {
          create: {
            status: dto.status as OrderStatus,
            message: `Admin intervention: ${dto.reason}`,
          },
        },
      },
    });

    // Log the action
    await this.createAuditLog(adminId, 'ORDER_STATUS_CHANGE', 'Order', orderId, {
      oldStatus: order.status,
      newStatus: dto.status,
    }, dto.reason);

    this.logger.log(`Admin ${adminId} changed order ${orderId} status to ${dto.status}`);

    return updatedOrder;
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters: { action?: string; targetType?: string; actorId?: string }) {
    const where: any = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.targetType) {
      where.targetType = filters.targetType;
    }

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs;
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: any,
    reason?: string,
  ) {
    await this.prisma.auditLog.create({
       {
        actorId,
        action,
        targetType,
        targetId,
        details,
        reason,
      },
    });
  }
}
