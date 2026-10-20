import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  @MinLength(1)
  label: string;

  @ApiProperty({ example: '45-B, Street 7, DHA Phase 5' })
  @IsString()
  @MinLength(5)
  street: string;

  @ApiProperty({ example: 'DHA' })
  @IsString()
  @MinLength(1)
  area: string;

  @ApiProperty({ example: 'Lahore' })
  @IsString()
  @MinLength(1)
  city: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
