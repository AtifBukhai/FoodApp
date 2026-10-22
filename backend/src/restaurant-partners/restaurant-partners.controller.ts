import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RestaurantPartnersService } from './restaurant-partners.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('restaurant-partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_OWNER)
@Controller('partner')
export class RestaurantPartnersController {
  constructor(private readonly restaurantPartnersService: RestaurantPartnersService) {}

  @Post('restaurants')
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  @ApiResponse({ status: 403, description: 'User is not a restaurant owner' })
  async createRestaurant(@Request() req, @Body() dto: CreateRestaurantDto) {
    return this.restaurantPartnersService.createRestaurant(req.user.id, dto);
  }

  @Get('restaurants')
  @ApiOperation({ summary: 'Get all restaurants owned by the user' })
  @ApiResponse({ status: 200, description: 'Restaurants retrieved successfully' })
  async getMyRestaurants(@Request() req) {
    return this.restaurantPartnersService.getMyRestaurants(req.user.id);
  }

  @Get('restaurants/:id')
  @ApiOperation({ summary: 'Get a specific restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  async getRestaurant(@Request() req, @Param('id') id: string) {
    return this.restaurantPartnersService.getRestaurant(req.user.id, id);
  }

  @Patch('restaurants/:id')
  @ApiOperation({ summary: 'Update restaurant details' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  async updateRestaurant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantPartnersService.updateRestaurant(req.user.id, id, dto);
  }

  @Delete('restaurants/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a restaurant (soft delete)' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  async deleteRestaurant(@Request() req, @Param('id') id: string) {
    return this.restaurantPartnersService.deleteRestaurant(req.user.id, id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders for all restaurants owned by the user' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getMyOrders(@Request() req, @Query('status') status?: string) {
    return this.restaurantPartnersService.getMyOrders(req.user.id, status);
  }

  @Patch('orders/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an order' })
  @ApiResponse({ status: 200, description: 'Order accepted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  @ApiResponse({ status: 400, description: 'Order cannot be accepted in current status' })
  async acceptOrder(@Request() req, @Param('id') id: string) {
    return this.restaurantPartnersService.acceptOrder(req.user.id, id);
  }

  @Patch('orders/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an order' })
  @ApiResponse({ status: 200, description: 'Order rejected successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  @ApiResponse({ status: 400, description: 'Order cannot be rejected in current status' })
  async rejectOrder(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.restaurantPartnersService.rejectOrder(req.user.id, id, reason);
  }

  @Patch('orders/:id/prepare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as preparing' })
  @ApiResponse({ status: 200, description: 'Order marked as preparing' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  @ApiResponse({ status: 400, description: 'Order must be confirmed before preparing' })
  async markAsPreparing(@Request() req, @Param('id') id: string) {
    return this.restaurantPartnersService.markAsPreparing(req.user.id, id);
  }

  @Patch('orders/:id/ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as ready for pickup' })
  @ApiResponse({ status: 200, description: 'Order marked as ready' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'User does not own this restaurant' })
  @ApiResponse({ status: 400, description: 'Order must be preparing before ready' })
  async markAsReady(@Request() req, @Param('id') id: string) {
    return this.restaurantPartnersService.markAsReady(req.user.id, id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics for all restaurants owned by the user' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics period' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics period' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.restaurantPartnersService.getAnalytics(req.user.id, start, end);
  }
}
