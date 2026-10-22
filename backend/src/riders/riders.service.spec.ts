import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RidersService } from './riders.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

describe('RidersService', () => {
  let service: RidersService;
  let prisma: PrismaService;

  const mockPrisma = {
    rider: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    delivery: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RidersService>(RidersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should throw NotFoundException if rider not found', async () => {
      mockPrisma.rider.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return rider profile if found', async () => {
      const mockRider = {
        id: 'rider-1',
        userId: 'user-1',
        vehicleType: 'motorcycle',
        isApproved: true,
        isAvailable: false,
        user: {
          id: 'user-1',
          name: 'Test Rider',
          email: 'rider@example.com',
          phone: '+923001234567',
        },
      };

      mockPrisma.rider.findUnique.mockResolvedValue(mockRider);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockRider);
    });
  });

  describe('updateAvailability', () => {
    it('should throw NotFoundException if rider not found', async () => {
      mockPrisma.rider.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAvailability('user-1', { isAvailable: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if rider not approved', async () => {
      const mockRider = {
        id: 'rider-1',
        userId: 'user-1',
        isApproved: false,
      };

      mockPrisma.rider.findUnique.mockResolvedValue(mockRider);

      await expect(
        service.updateAvailability('user-1', { isAvailable: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update availability if rider is approved', async () => {
      const mockRider = {
        id: 'rider-1',
        userId: 'user-1',
        isApproved: true,
        isAvailable: false,
      };

      mockPrisma.rider.findUnique.mockResolvedValue(mockRider);
      mockPrisma.rider.update.mockResolvedValue({ ...mockRider, isAvailable: true });

      const result = await service.updateAvailability('user-1', { isAvailable: true });

      expect(result.isAvailable).toBe(true);
    });
  });

  describe('acceptDelivery', () => {
    it('should throw NotFoundException if rider not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue(null);
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if rider not approved', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          isApproved: false,
        });
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if rider not available', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          isApproved: true,
          isAvailable: false,
        });
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if rider has active delivery', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          isApproved: true,
          isAvailable: true,
        });
        mockPrisma.delivery.findFirst.mockResolvedValue({
          id: 'delivery-1',
          status: DeliveryStatus.ACCEPTED,
        });
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          isApproved: true,
          isAvailable: true,
        });
        mockPrisma.delivery.findFirst.mockResolvedValue(null);
        mockPrisma.order.findUnique.mockResolvedValue(null);
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if order not ready for pickup', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          isApproved: true,
          isAvailable: true,
        });
        mockPrisma.delivery.findFirst.mockResolvedValue(null);
        mockPrisma.order.findUnique.mockResolvedValue({
          id: 'order-1',
          status: OrderStatus.PREPARING,
          delivery: null,
        });
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if delivery already assigned', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          isApproved: true,
          isAvailable: true,
        });
        mockPrisma.delivery.findFirst.mockResolvedValue(null);
        mockPrisma.order.findUnique.mockResolvedValue({
          id: 'order-1',
          status: OrderStatus.READY_FOR_PICKUP,
          delivery: { id: 'delivery-1' },
        });
        return callback(mockPrisma);
      });

      await expect(service.acceptDelivery('user-1', 'order-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should accept delivery successfully', async () => {
      const mockDelivery = {
        id: 'delivery-1',
        orderId: 'order-1',
        riderId: 'rider-1',
        status: DeliveryStatus.ACCEPTED,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
          isApproved: true,
          isAvailable: true,
        });
        mockPrisma.delivery.findFirst.mockResolvedValue(null);
        mockPrisma.order.findUnique.mockResolvedValue({
          id: 'order-1',
          status: OrderStatus.READY_FOR_PICKUP,
          delivery: null,
          deliveryFee: 10000,
        });
        mockPrisma.delivery.create.mockResolvedValue(mockDelivery);
        mockPrisma.order.update.mockResolvedValue({});
        return callback(mockPrisma);
      });

      const result = await service.acceptDelivery('user-1', 'order-1');

      expect(result.status).toBe(DeliveryStatus.ACCEPTED);
      expect(mockPrisma.delivery.create).toHaveBeenCalled();
    });
  });

  describe('confirmPickup', () => {
    it('should throw NotFoundException if delivery not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue(null);
        return callback(mockPrisma);
      });

      await expect(service.confirmPickup('user-1', 'delivery-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if rider not assigned', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue({
          id: 'delivery-1',
          riderId: 'rider-2',
          status: DeliveryStatus.ACCEPTED,
          order: { id: 'order-1' },
        });
        return callback(mockPrisma);
      });

      await expect(service.confirmPickup('user-1', 'delivery-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if delivery not accepted', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue({
          id: 'delivery-1',
          riderId: 'rider-1',
          status: DeliveryStatus.ASSIGNED,
          order: { id: 'order-1' },
        });
        return callback(mockPrisma);
      });

      await expect(service.confirmPickup('user-1', 'delivery-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should confirm pickup successfully', async () => {
      const mockDelivery = {
        id: 'delivery-1',
        status: DeliveryStatus.PICKED_UP,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue({
          id: 'delivery-1',
          riderId: 'rider-1',
          status: DeliveryStatus.ACCEPTED,
          order: { id: 'order-1' },
        });
        mockPrisma.delivery.update.mockResolvedValue(mockDelivery);
        mockPrisma.order.update.mockResolvedValue({});
        return callback(mockPrisma);
      });

      const result = await service.confirmPickup('user-1', 'delivery-1');

      expect(result.status).toBe(DeliveryStatus.PICKED_UP);
    });
  });

  describe('confirmDelivery', () => {
    it('should throw BadRequestException if order not picked up', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue({
          id: 'delivery-1',
          riderId: 'rider-1',
          status: DeliveryStatus.ACCEPTED,
          baseFee: 10000,
          order: { id: 'order-1' },
        });
        return callback(mockPrisma);
      });

      await expect(service.confirmDelivery('user-1', 'delivery-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should confirm delivery successfully', async () => {
      const mockDelivery = {
        id: 'delivery-1',
        status: DeliveryStatus.DELIVERED,
        baseFee: 10000,
        tip: 0,
        totalEarnings: 10000,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue({
          id: 'delivery-1',
          riderId: 'rider-1',
          status: DeliveryStatus.PICKED_UP,
          baseFee: 10000,
          order: { id: 'order-1' },
        });
        mockPrisma.delivery.update.mockResolvedValue(mockDelivery);
        mockPrisma.order.update.mockResolvedValue({});
        mockPrisma.rider.update.mockResolvedValue({});
        return callback(mockPrisma);
      });

      const result = await service.confirmDelivery('user-1', 'delivery-1');

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
      expect(result.totalEarnings).toBe(10000);
    });

    it('should include tip in earnings', async () => {
      const mockDelivery = {
        id: 'delivery-1',
        status: DeliveryStatus.DELIVERED,
        baseFee: 10000,
        tip: 5000,
        totalEarnings: 15000,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.rider.findUnique.mockResolvedValue({
          id: 'rider-1',
          userId: 'user-1',
        });
        mockPrisma.delivery.findUnique.mockResolvedValue({
          id: 'delivery-1',
          riderId: 'rider-1',
          status: DeliveryStatus.PICKED_UP,
          baseFee: 10000,
          order: { id: 'order-1' },
        });
        mockPrisma.delivery.update.mockResolvedValue(mockDelivery);
        mockPrisma.order.update.mockResolvedValue({});
        mockPrisma.rider.update.mockResolvedValue({});
        return callback(mockPrisma);
      });

      const result = await service.confirmDelivery('user-1', 'delivery-1', { tip: 5000 });

      expect(result.totalEarnings).toBe(15000);
    });
  });

  describe('getEarnings', () => {
    it('should throw NotFoundException if rider not found', async () => {
      mockPrisma.rider.findUnique.mockResolvedValue(null);

      await expect(service.getEarnings('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should calculate earnings correctly', async () => {
      const mockDeliveries = [
        { baseFee: 10000, tip: 2000, totalEarnings: 12000, deliveredAt: new Date() },
        { baseFee: 15000, tip: 0, totalEarnings: 15000, deliveredAt: new Date() },
      ];

      mockPrisma.rider.findUnique.mockResolvedValue({ id: 'rider-1' });
      mockPrisma.delivery.findMany.mockResolvedValue(mockDeliveries);

      const result = await service.getEarnings('user-1');

      expect(result.totalEarnings).toBe(27000);
      expect(result.totalBaseFees).toBe(25000);
      expect(result.totalTips).toBe(2000);
      expect(result.totalDeliveries).toBe(2);
    });
  });
});
