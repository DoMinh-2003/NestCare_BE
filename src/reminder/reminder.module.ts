import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { Reminder } from './entities/reminder.entity';
import { User } from 'src/users/model/user.entity';
import { MailService } from 'src/common/service/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, User])],
  controllers: [ReminderController],
  providers: [ReminderService,MailService],
})
export class ReminderModule {}
