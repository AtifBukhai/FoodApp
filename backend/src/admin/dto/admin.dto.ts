import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class ChangeUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SuspendUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveRestaurantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRestaurantDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

export class ApproveRiderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRiderDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED'] })
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class UpdatePlatformConfigDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class DashboardMetricsDto {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurantApprovals: number;
  suspendedRestaurants: number;
  
  totalRiders: number;
  approvedRiders: number;
  pendingRiderApprovals: number;
  availableRiders: number;
  
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  grossOrderValue: number;
  platformRevenue: number;
  deliveryFees: number;
  riderEarnings: number;
  platformCommission: number;
  
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
}
