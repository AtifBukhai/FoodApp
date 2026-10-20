import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantFiltersDto } from './dto/restaurant-filters.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: RestaurantFiltersDto) {
    const { cuisine, search, sortBy, page = 1, limit = 20 } = filters;

    const where: any = {
      isApproved: true,
      deletedAt: null,
    };

    if (cuisine) {
      where.cuisine = { has: cuisine };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cuisine: { has: search } },
      ];
    }

    const orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'delivery_time':
        // Note: delivery_time is a string like "25-35 min", so we can't sort directly
        // In a real implementation, you'd store min/max delivery times as integers
        orderBy.createdAt = 'desc';
        break;
      case 'price':
        orderBy.deliveryFee = 'asc';
        break;
      default:
        orderBy.rating = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          nameUrdu: true,
          description: true,
          descriptionUrdu: true,
          cuisine: true,
          rating: true,
          reviewCount: true,
          deliveryTime: true,
          deliveryFee: true,
          minOrder: true,
          imageUrl: true,
          isOpen: true,
          isFeatured: true,
          address: true,
        },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      items: items.map(item => ({
        ...item,
        // Convert paisa to PKR for frontend
        deliveryFee: item.deliveryFee / 100,
        minOrder: item.minOrder / 100,
      })),
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        nameUrdu: true,
        description: true,
        descriptionUrdu: true,
        cuisine: true,
        rating: true,
        reviewCount: true,
        deliveryTime: true,
        deliveryFee: true,
        minOrder: true,
        imageUrl: true,
        isOpen: true,
        isFeatured: true,
        address: true,
        openingHours: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return {
      ...restaurant,
      deliveryFee: restaurant.deliveryFee / 100,
      minOrder: restaurant.minOrder / 100,
    };
  }

  async getMenu(restaurantId: string) {
    // Verify restaurant exists
    await this.findOne(restaurantId);

    const categories = await this.prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { isPopular: 'desc' },
          select: {
            id: true,
            name: true,
            nameUrdu: true,
            description: true,
            descriptionUrdu: true,
            price: true,
            imageUrl: true,
            isVegetarian: true,
            isVegan: true,
            isSpicy: true,
            isAvailable: true,
            isPopular: true,
          },
        },
      },
    });

    // Flatten and convert prices
    const menuItems = categories.flatMap(category =>
      category.items.map(item => ({
        id: item.id,
        restaurantId,
        name: item.name,
        nameUrdu: item.nameUrdu,
        description: item.description,
        descriptionUrdu: item.descriptionUrdu,
        price: item.price / 100, // Convert paisa to PKR
        image: item.imageUrl || '',
        category: category.name,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isSpicy: item.isSpicy,
        isAvailable: item.isAvailable,
        popular: item.isPopular,
      })),
    );

    return menuItems;
  }

  async getCategories() {
    // Return predefined categories
    // In a real implementation, these would come from the database
    return [
      { id: '1', name: 'Pakistani', nameUrdu: 'پاکستانی', icon: '🍛', slug: 'pakistani' },
      { id: '2', name: 'Fast Food', nameUrdu: 'فاسٹ فوڈ', icon: '🍔', slug: 'fast-food' },
      { id: '3', name: 'Chinese', nameUrdu: 'چینی', icon: '🥡', slug: 'chinese' },
      { id: '4', name: 'BBQ & Grill', nameUrdu: 'بی بی کیو', icon: '🍖', slug: 'bbq' },
      { id: '5', name: 'Biryani & Rice', nameUrdu: 'بریانی', icon: '🍚', slug: 'biryani' },
      { id: '6', name: 'Pizza', nameUrdu: 'پزا', icon: '🍕', slug: 'pizza' },
      { id: '7', name: 'Burgers', nameUrdu: 'برگر', icon: '🍔', slug: 'burgers' },
      { id: '8', name: 'Desserts', nameUrdu: 'میٹھا', icon: '🍰', slug: 'desserts' },
      { id: '9', name: 'Beverages', nameUrdu: 'مشروبات', icon: '🥤', slug: 'beverages' },
      { id: '10', name: 'Breakfast', nameUrdu: 'ناشتہ', icon: '🍳', slug: 'breakfast' },
      { id: '11', name: 'Seafood', nameUrdu: 'سمندری غذا', icon: '🦐', slug: 'seafood' },
      { id: '12', name: 'Healthy', nameUrdu: 'صحت مند', icon: '🥗', slug: 'healthy' },
    ];
  }
}
