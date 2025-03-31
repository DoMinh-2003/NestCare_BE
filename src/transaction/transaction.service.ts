import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { ServiceBilling } from 'src/appointment/entities/service-billing.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';
import { User } from 'src/users/model/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(ServiceBilling)
    private serviceBillingRepo: Repository<ServiceBilling>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(UserPackages)
    private userPackagesRepo: Repository<UserPackages>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
    
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepo.create(dto);

    if (dto.serviceBillingId) {
      const serviceBilling = await this.serviceBillingRepo.findOneBy({ id: dto.serviceBillingId });
      if (serviceBilling) {
        transaction.serviceBilling = serviceBilling;
      }
      // Xử lý trường hợp không tìm thấy serviceBilling nếu cần
    }

    if (dto.appointmentId) {
      const appointment = await this.appointmentRepo.findOneBy({ id: dto.appointmentId });
      if (appointment) {
        transaction.appointment = appointment;
      }
      // Xử lý trường hợp không tìm thấy appointment nếu cần
    }

    if (dto.userPackageId) {
      const userPackage = await this.userPackagesRepo.findOneBy({ id: dto.userPackageId });
      if (userPackage) {
        transaction.userPackage = userPackage;
      }
      // Xử lý trường hợp không tìm thấy userPackage nếu cần
    }

    if (dto.userId) {
        const user = await this.userRepo.findOneBy({ id: dto.userId });
        if (user) {
          transaction.user = user;
        }
        // Xử lý trường hợp không tìm thấy userPackage nếu cần
      }

    return this.transactionRepo.save(transaction);
  }

  async findAllByUser(userId: string) {
    return this.transactionRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'appointment', 'userPackage'], // Eager load relations if needed
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.transactionRepo.findOne({
      where: { id },
      relations: ['user', 'appointment', 'userPackage'],
    });
  }

  // Add other service methods as needed, e.g., find by type, find by status, etc.
}