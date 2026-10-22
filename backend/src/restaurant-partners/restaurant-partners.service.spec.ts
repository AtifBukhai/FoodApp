import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { RestaurantPartnersService } from './restaurant-partners.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('RestaurantPartnersService', () => {
  let service: RestaurantPartnersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    restaurant: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantPartnersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RestaurantPartnersService>(RestaurantPartnersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRestaurant', () => {
    it('should throw ForbiddenException if user is not a restaurant owner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: UserRole.CUSTOMER });

      await expect(
        service.createRestaurant('user-1', {
          name: 'Test Restaurant',
          phone: '+923001234567',
          address: 'Test Address',
          city: 'Lahore',
          area: 'Gulberg',
          cuisine: ['Pakistani'],
          deliveryTime: '30-40 min',
          deliveryFee: 10000,
          minOrder: 20000,
          openingHours: [],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create restaurant successfully for restaurant owner', async () => {
      const mockUser = { role: UserRole.RESTAURANT_OWNER };
      const mockRestaurant = {
        id: 'rest-1',
        name: 'Test Restaurant',
        ownerId: 'user-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.restaurant.create.mockResolvedValue(mockRestaurant);

      const result = await service.createRestaurant('user-1', {
        name: 'Test Restaurant',
        phone: '+923001234567',
        address: 'Test Address',
        city: 'Lahore',
        area: 'Gulberg',
        cuisine: ['Pakistani'],
        deliveryTime: '30-40 min',
        deliveryFee: 10000,
        minOrder: 20000,
        openingHours: [],
      });

      expect(result).toEqual(mockRestaurant);
      expect(mockPrisma.restaurant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Restaurant',
          ownerId: 'user-1',
          isApproved: false,
          isOpen: false,
        }),
      });
    });
  });

  describe('getMyRestaurants', () => {
    it('should return all restaurants owned by the user', async () => {
      const mockRestaurants = [
        { id: 'rest-1', name: 'Restaurant 1', ownerId: 'user-1' },
        { id: 'rest-2', name: 'Restaurant 2', ownerId: 'user-1' },
      ];

      mockPrisma.restaurant.findMany.mockResolvedValue(mockRestaurants);

      const result = await service.getMyRestaurants('user-1');

      expect(result).toEqual(mockRestaurants);
      expect(mockPrisma.restaurant.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1', deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getRestaurant', () => {
    it('should throw NotFoundException if restaurant not found', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.getRestaurant('user-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the restaurant', async () => {
      const mockRestaurant = { id: 'rest-1', ownerId: 'user-2' };
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      await expect(service.getRestaurant('user-1', 'rest-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return restaurant if user owns it', async () => {
      const mockRestaurant = { id: 'rest-1', ownerId: 'user-1' };
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const result = await service.getRestaurant('user-1', 'rest-1');

      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('acceptOrder', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.acceptOrder('user-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the restaurant', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'PENDING',
        restaurant: { ownerId: 'user-2' },
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.acceptOrder('user-1', 'order-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if order is not pending', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'CONFIRMED',
        restaurant: { ownerId: 'user-1' },
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.acceptOrder('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept order successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'PENDING',
        restaurant: { ownerId: 'user-1' },
      };
      const updatedOrder = { ...mockOrder, status: 'CONFIRMED' };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(updatedOrder);

      const result = await service.acceptOrder('user-1', 'order-1');

      expect(result.status).toBe('CONFIRMED');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          status: 'CONFIRMED',
        }),
      });
    });
  });

  describe('rejectOrder', () => {
    it('should reject order successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'PENDING',
        restaurant: { ownerId: 'user-1' },
      };
      const updatedOrder = { ...mockOrder, status: 'CANCELLED' };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(updatedOrder);

      const result = await service.rejectOrder('user-1', 'order-1', 'Not available');

      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('getAnalytics', () => {
    it('should return empty analytics if user has no restaurants', async () => {
      mockPrisma.restaurant.findMany.mockResolvedValue([]);

      const result = await service.getAnalytics('user-1');

      expect(result).toEqual({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
      });
    });

    it('should calculate analytics correctly', async () => {
      const mockRestaurants = [{ id: 'rest-1' }];
      const mockOrders = [
        { total: 10000, status: 'DELIVERED' },
        { total: 20000, status: 'DELIVERED' },
        { total: 15000, status: 'PENDING' },
      ];

      mockPrisma.restaurant.findMany.mockResolvedValue(mockRestaurants);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getAnalytics('user-1');

      expect(result.totalOrders).toBe(3);
      expect(result.totalRevenue).toBe(30000); // Only delivered orders
      expect(result.averageOrderValue).toBe(10000);
      expect(result.ordersByStatus).toEqual({
        DELIVERED: 2,
        PENDING: 1,
      });
    });
  });
});
