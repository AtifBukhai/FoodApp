import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  ChangeUserRoleDto,
  SuspendUserDto,
  ApproveRestaurantDto,
  RejectRestaurantDto,
  ApproveRiderDto,
  RejectRiderDto,
  UpdateOrderStatusDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved' })
  async getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getUsers(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({ role, isActive, search });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user role' })
  async changeUserRole(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ChangeUserRoleDto,
  ) {
    return this.adminService.changeUserRole(req.user.id, id, dto);
  }

  @Patch('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend user' })
  async suspendUser(@Request() req, @Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.adminService.suspendUser(req.user.id, id, dto);
  }

  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user' })
  async activateUser(@Request() req, @Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.adminService.activateUser(req.user.id, id, dto);
  }

  @Get('restaurants')
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiQuery({ name: 'isApproved', required: false })
  @ApiQuery({ name: 'isOpen', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getRestaurants(
    @Query('isApproved') isApproved?: boolean,
    @Query('isOpen') isOpen?: boolean,
    @Query('search') search?: string,
  ) {
    return this.adminService.getRestaurants({ isApproved, isOpen, search });
  }

  @Post('restaurants/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve restaurant' })
  async approveRestaurant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ApproveRestaurantDto,
  ) {
    return this.adminService.approveRestaurant(req.user.id, id, dto);
  }

  @Post('restaurants/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject restaurant' })
  async rejectRestaurant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RejectRestaurantDto,
  ) {
    return this.adminService.rejectRestaurant(req.user.id, id, dto);
  }

  @Patch('restaurants/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend restaurant' })
  async suspendRestaurant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SuspendUserDto,
  ) {
    return this.adminService.suspendRestaurant(req.user.id, id, dto);
  }

  @Patch('restaurants/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate restaurant' })
  async activateRestaurant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SuspendUserDto,
  ) {
    return this.adminService.activateRestaurant(req.user.id, id, dto);
  }

  @Get('riders')
  @ApiOperation({ summary: 'Get all riders' })
  @ApiQuery({ name: 'isApproved', required: false })
  @ApiQuery({ name: 'isAvailable', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getRiders(
    @Query('isApproved') isApproved?: boolean,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('search') search?: string,
  ) {
    return this.adminService.getRiders({ isApproved, isAvailable, search });
  }

  @Post('riders/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve rider' })
  async approveRider(@Request() req, @Param('id') id: string, @Body() dto: ApproveRiderDto) {
    return this.adminService.approveRider(req.user.id, id, dto);
  }

  @Post('riders/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject rider' })
  async rejectRider(@Request() req, @Param('id') id: string, @Body() dto: RejectRiderDto) {
    return this.adminService.rejectRider(req.user.id, id, dto);
  }

  @Patch('riders/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend rider' })
  async suspendRider(@Request() req, @Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.adminService.suspendRider(req.user.id, id, dto);
  }

  @Patch('riders/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate rider' })
  async activateRider(@Request() req, @Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.adminService.activateRider(req.user.id, id, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'restaurantId', required: false })
  @ApiQuery({ name: 'riderId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getOrders(
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('riderId') riderId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getOrders({ status, paymentStatus, restaurantId, riderId, search });
  }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (admin intervention)' })
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(req.user.id, id, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'targetType', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.adminService.getAuditLogs({ action, targetType, actorId });
  }
}
