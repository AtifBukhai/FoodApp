import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn(),
    restaurant: {
      findUnique: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if restaurant not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.restaurant.findUnique.mockResolvedValue(null);
        return callback(mockPrisma);
      });

      await expect(
        service.create('user-1', {
          restaurantId: 'invalid-restaurant',
          items: [{ menuItemId: 'item-1', quantity: 1 }],
          deliveryAddressId: 'addr-1',
          paymentMethod: 'cod',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if restaurant is closed', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.restaurant.findUnique.mockResolvedValue({
          id: 'rest-1',
          isOpen: false,
          isApproved: true,
        });
        return callback(mockPrisma);
      });

      await expect(
        service.create('user-1', {
          restaurantId: 'rest-1',
          items: [{ menuItemId: 'item-1', quantity: 1 }],
          deliveryAddressId: 'addr-1',
          paymentMethod: 'cod',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if address does not belong to user', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.restaurant.findUnique.mockResolvedValue({
          id: 'rest-1',
          isOpen: true,
          isApproved: true,
          minOrder: 30000,
          deliveryFee: 8000,
        });
        mockPrisma.address.findUnique.mockResolvedValue({
          id: 'addr-1',
          userId: 'other-user',
        });
        return callback(mockPrisma);
      });

      await expect(
        service.create('user-1', {
          restaurantId: 'rest-1',
          items: [{ menuItemId: 'item-1', quantity: 1 }],
          deliveryAddressId: 'addr-1',
          paymentMethod: 'cod',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should calculate totals from database prices, not client input', async () => {
      const menuItem = {
        id: 'item-1',
        name: 'Test Item',
        price: 145000, // 1450 PKR in paisa
        isAvailable: true,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.restaurant.findUnique.mockResolvedValue({
          id: 'rest-1',
          isOpen: true,
          isApproved: true,
          minOrder: 30000, // 300 PKR
          deliveryFee: 8000, // 80 PKR
        });
        mockPrisma.address.findUnique.mockResolvedValue({
          id: 'addr-1',
          userId: 'user-1',
        });
        mockPrisma.menuItem.findMany.mockResolvedValue([menuItem]);
        mockPrisma.order.create.mockResolvedValue({
          id: 'order-1',
          orderNumber: 'KD-TEST',
          userId: 'user-1',
          restaurantId: 'rest-1',
          addressId: 'addr-1',
          subtotal: 290000, // 2 * 145000
          deliveryFee: 8000,
          tax: 14500, // 5% of 290000
          discount: 0,
          total: 312500,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          status: 'PENDING',
          estimatedDelivery: new Date(),
          createdAt: new Date(),
          items: [],
          statusHistory: [],
          restaurant: { name: 'Test Restaurant' },
          address: {
            id: 'addr-1',
            label: 'Home',
            street: 'Test Street',
            area: 'Test Area',
            city: 'Test City',
            isDefault: true,
          },
        });
        return callback(mockPrisma);
      });

      const result = await service.create('user-1', {
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', quantity: 2 }],
        deliveryAddressId: 'addr-1',
        paymentMethod: 'cod',
      });

      // Verify totals are calculated from database prices
      expect(result.subtotal).toBe(2900); // 290000 paisa = 2900 PKR
      expect(result.deliveryFee).toBe(80); // 8000 paisa = 80 PKR
      expect(result.tax).toBe(145); // 14500 paisa = 145 PKR
      expect(result.total).toBe(3125); // 312500 paisa = 3125 PKR
    });

    it('should throw BadRequestException if minimum order not met', async () => {
      const menuItem = {
        id: 'item-1',
        name: 'Test Item',
        price: 10000, // 100 PKR
        isAvailable: true,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.restaurant.findUnique.mockResolvedValue({
          id: 'rest-1',
          isOpen: true,
          isApproved: true,
          minOrder: 30000, // 300 PKR minimum
          deliveryFee: 8000,
        });
        mockPrisma.address.findUnique.mockResolvedValue({
          id: 'addr-1',
          userId: 'user-1',
        });
        mockPrisma.menuItem.findMany.mockResolvedValue([menuItem]);
        return callback(mockPrisma);
      });

      await expect(
        service.create('user-1', {
          restaurantId: 'rest-1',
          items: [{ menuItemId: 'item-1', quantity: 1 }], // Only 100 PKR
          deliveryAddressId: 'addr-1',
          paymentMethod: 'cod',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-order', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if order does not belong to user', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'other-user',
      });

      await expect(service.findOne('order-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return order if it belongs to user', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'KD-TEST',
        userId: 'user-1',
        restaurantId: 'rest-1',
        addressId: 'addr-1',
        subtotal: 145000,
        deliveryFee: 8000,
        tax: 7250,
        discount: 0,
        total: 160250,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        estimatedDelivery: new Date(),
        createdAt: new Date(),
        items: [],
        statusHistory: [],
        restaurant: { name: 'Test Restaurant' },
        address: {
          id: 'addr-1',
          label: 'Home',
          street: 'Test Street',
          area: 'Test Area',
          city: 'Test City',
          isDefault: true,
        },
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1', 'user-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
    });
  });

  describe('cancel', () => {
    it('should throw BadRequestException if order status is not PENDING or CONFIRMED', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.order.findUnique.mockResolvedValue({
          id: 'order-1',
          userId: 'user-1',
          status: 'PREPARING',
        });
        return callback(mockPrisma);
      });

      await expect(service.cancel('order-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow cancellation if order is PENDING', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        mockPrisma.order.findUnique.mockResolvedValue({
          id: 'order-1',
          userId: 'user-1',
          status: 'PENDING',
          orderNumber: 'KD-TEST',
        });
        mockPrisma.order.update.mockResolvedValue({
          id: 'order-1',
          status: 'CANCELLED',
          orderNumber: 'KD-TEST',
          userId: 'user-1',
          restaurantId: 'rest-1',
          addressId: 'addr-1',
          subtotal: 145000,
          deliveryFee: 8000,
          tax: 7250,
          discount: 0,
          total: 160250,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          estimatedDelivery: new Date(),
          createdAt: new Date(),
          items: [],
          statusHistory: [],
          restaurant: { name: 'Test Restaurant' },
          address: {
            id: 'addr-1',
            label: 'Home',
            street: 'Test Street',
            area: 'Test Area',
            city: 'Test City',
            isDefault: true,
          },
        });
        return callback(mockPrisma);
      });

      const result = await service.cancel('order-1', 'user-1');
      expect(result.status).toBe('cancelled');
    });
  });
});
