import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RidersService } from './riders.service';
import {
  UpdateRiderProfileDto,
  UpdateAvailabilityDto,
  UpdateLocationDto,
  AcceptDeliveryDto,
  DeclineDeliveryDto,
  ConfirmPickupDto,
  ConfirmDeliveryDto,
} from './dto/rider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('riders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RIDER)
@Controller('rider')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get rider profile' })
  @ApiResponse({ status: 200, description: 'Rider profile retrieved' })
  async getProfile(@Request() req) {
    return this.ridersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update rider profile' })
  @ApiResponse({ status: 200, description: 'Rider profile updated' })
  async updateProfile(@Request() req, @Body() dto: UpdateRiderProfileDto) {
    return this.ridersService.updateProfile(req.user.id, dto);
  }

  @Post('availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update rider availability' })
  @ApiResponse({ status: 200, description: 'Availability updated' })
  async updateAvailability(@Request() req, @Body() dto: UpdateAvailabilityDto) {
    return this.ridersService.updateAvailability(req.user.id, dto);
  }

  @Post('location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update rider location' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateLocation(@Request() req, @Body() dto: UpdateLocationDto) {
    return this.ridersService.updateLocation(req.user.id, dto);
  }

  @Get('deliveries/available')
  @ApiOperation({ summary: 'Get available delivery offers' })
  @ApiResponse({ status: 200, description: 'Available deliveries retrieved' })
  async getAvailableDeliveries(@Request() req) {
    return this.ridersService.getAvailableDeliveries(req.user.id);
  }

  @Post('deliveries/:orderId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a delivery' })
  @ApiResponse({ status: 200, description: 'Delivery accepted' })
  @ApiResponse({ status: 400, description: 'Cannot accept delivery' })
  @ApiResponse({ status: 409, description: 'Delivery already assigned' })
  async acceptDelivery(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() dto?: AcceptDeliveryDto,
  ) {
    return this.ridersService.acceptDelivery(req.user.id, orderId, dto);
  }

  @Post('deliveries/:orderId/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline a delivery' })
  @ApiResponse({ status: 200, description: 'Delivery declined' })
  async declineDelivery(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() dto?: DeclineDeliveryDto,
  ) {
    return this.ridersService.declineDelivery(req.user.id, orderId, dto);
  }

  @Get('deliveries/active')
  @ApiOperation({ summary: 'Get active deliveries' })
  @ApiResponse({ status: 200, description: 'Active deliveries retrieved' })
  async getActiveDeliveries(@Request() req) {
    return this.ridersService.getActiveDeliveries(req.user.id);
  }

  @Get('deliveries/completed')
  @ApiOperation({ summary: 'Get completed deliveries' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Completed deliveries retrieved' })
  async getCompletedDeliveries(@Request() req, @Query('limit') limit?: number) {
    return this.ridersService.getCompletedDeliveries(req.user.id, limit);
  }

  @Post('deliveries/:deliveryId/pickup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm pickup' })
  @ApiResponse({ status: 200, description: 'Pickup confirmed' })
  @ApiResponse({ status: 400, description: 'Cannot confirm pickup' })
  async confirmPickup(
    @Request() req,
    @Param('deliveryId') deliveryId: string,
    @Body() dto?: ConfirmPickupDto,
  ) {
    return this.ridersService.confirmPickup(req.user.id, deliveryId, dto);
  }

  @Post('deliveries/:deliveryId/delivered')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm delivery' })
  @ApiResponse({ status: 200, description: 'Delivery confirmed' })
  @ApiResponse({ status: 400, description: 'Cannot confirm delivery' })
  async confirmDelivery(
    @Request() req,
    @Param('deliveryId') deliveryId: string,
    @Body() dto?: ConfirmDeliveryDto,
  ) {
    return this.ridersService.confirmDelivery(req.user.id, deliveryId, dto);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get earnings summary' })
  @ApiResponse({ status: 200, description: 'Earnings summary retrieved' })
  async getEarnings(@Request() req) {
    return this.ridersService.getEarnings(req.user.id);
  }

  @Get('earnings/history')
  @ApiOperation({ summary: 'Get earnings history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Earnings history retrieved' })
  async getEarningsHistory(@Request() req, @Query('limit') limit?: number) {
    return this.ridersService.getEarningsHistory(req.user.id, limit);
  }
}
