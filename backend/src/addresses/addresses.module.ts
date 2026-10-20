import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses.module';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
