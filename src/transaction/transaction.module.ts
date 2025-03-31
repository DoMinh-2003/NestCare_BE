import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { ServiceBilling } from 'src/appointment/entities/service-billing.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';
import { User } from 'src/users/model/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User , ServiceBilling, Appointment, UserPackages])],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService, TypeOrmModule], // Export service and module if other modules need them
})
export class TransactionModule {}