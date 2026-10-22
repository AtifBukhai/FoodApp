import { IsString, IsOptional, IsArray, IsNumber, Min, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Lahori Chargha' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'لاہوری چرغہ' })
  @IsOptional()
  @IsString()
  nameUrdu?: string;

  @ApiProperty({ example: 'Authentic Lahori chargha and traditional Pakistani BBQ' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'اصل لاہوری چرغہ اور روایتی پاکستانی بی بی کیو' })
  @IsOptional()
  @IsString()
  descriptionUrdu?: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'MM Alam Road, Gulberg III' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Lahore' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Gulberg' })
  @IsString()
  area: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: ['Pakistani', 'BBQ'] })
  @IsArray()
  @IsString({ each: true })
  cuisine: string[];

  @ApiProperty({ example: '25-35 min' })
  @IsString()
  deliveryTime: string;

  @ApiProperty({ example: 8000, description: 'Delivery fee in paisa (PKR * 100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @ApiProperty({ example: 30000, description: 'Minimum order in paisa (PKR * 100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrder: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: [
      { day: 'Mon-Fri', open: '10:00', close: '22:00' },
      { day: 'Sat-Sun', open: '11:00', close: '23:00' },
    ],
  })
  @IsArray()
  @IsObject({ each: true })
  openingHours: Array<{ day: string; open: string; close: string }>;
}

export class UpdateRestaurantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameUrdu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionUrdu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisine?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  openingHours?: Array<{ day: string; open: string; close: string }>;
}
