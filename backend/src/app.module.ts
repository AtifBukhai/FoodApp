import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { RestaurantPartnersModule } from './restaurant-partners/restaurant-partners.module';
import { RidersModule } from './riders/riders.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { AdminModule } from './admin/admin.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Feature modules
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    RestaurantPartnersModule,
    RidersModule,
    OrdersModule,
    AddressesModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
