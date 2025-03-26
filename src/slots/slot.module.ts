import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { Slot } from './entities/slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Slot])],
  providers: [SlotService],
  controllers: [SlotController],
    exports: [SlotService],
})
export class SlotModule {}
