import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRiderProfileDto {
  @ApiPropertyOptional({ example: 'motorcycle' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiPropertyOptional({ example: 'LIC-5678' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;
}

export class UpdateAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 31.5204 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 74.3587 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class AcceptDeliveryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DeclineDeliveryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ConfirmPickupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmDeliveryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 0, description: 'Tip in paisa' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tip?: number;
}
