import {
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  modifiers?: any[];
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  restaurantId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsString()
  deliveryAddressId: string;

  @ApiProperty({ enum: ['cod', 'online'] })
  @IsEnum(['cod', 'online'])
  paymentMethod: 'cod' | 'online';
}
