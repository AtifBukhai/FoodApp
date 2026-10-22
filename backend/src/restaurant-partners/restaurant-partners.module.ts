import { Module } from '@nestjs/common';
import { RestaurantPartnersService } from './restaurant-partners.service';
import { RestaurantPartnersController } from './restaurant-partners.controller';

@Module({
  controllers: [RestaurantPartnersController],
  providers: [RestaurantPartnersService],
  exports: [RestaurantPartnersService],
})
export class RestaurantPartnersModule {}
