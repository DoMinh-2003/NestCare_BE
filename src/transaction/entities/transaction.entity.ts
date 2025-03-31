// transaction.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { User } from 'src/users/model/user.entity';
  import { UserPackages } from 'src/userPackages/entities/userPackages.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { ServiceBilling } from 'src/appointment/entities/service-billing.entity';
  
  export enum TransactionType {
    DEPOSIT = 'DEPOSIT', // Nạp tiền (ví dụ: cọc)
    PURCHASE_PACKAGE = 'PURCHASE_PACKAGE', // Mua gói dịch vụ
    SERVICE_PAYMENT = 'SERVICE_PAYMENT', // Thanh toán dịch vụ lẻ
    REFUND = 'REFUND', // Hoàn tiền
    DEPOSIT_USAGE = 'DEPOSIT_USAGE',
    WITHDRAWAL = 'WITHDRAWAL', // Rút tiền (nếu có)
    // Thêm các loại giao dịch khác nếu cần
  }
  
  export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    // Thêm các trạng thái khác nếu cần
  }
  
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, (user) => user.transactions)
    user: User;
  
    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;
  
    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
  
    @Column({ nullable: true })
    description?: string; // Mô tả chi tiết về giao dịch
  
    @Column({ nullable: true })
    paymentGatewayReference?: string; // Mã tham chiếu từ cổng thanh toán (ví dụ: VNPAY transaction ID)
  
    @ManyToOne(() => Appointment, (appointment) => appointment.transactions, { nullable: true, onDelete: 'SET NULL' })
    appointment?: Appointment; // Liên kết với cuộc hẹn (nếu là thanh toán dịch vụ)
  
    @ManyToOne(() => UserPackages, (userPackage) => userPackage.transactions, { nullable: true, onDelete: 'SET NULL' })
    userPackage?: UserPackages; // Liên kết với gói đã mua

    @ManyToOne(() => ServiceBilling, (serviceBilling) => serviceBilling.transactions, { nullable: true, onDelete: 'SET NULL' })
    serviceBilling?: ServiceBilling; // Liên kết với gói đã mua
  
    @CreateDateColumn()
    createdAt: Date;
  
    // Có thể thêm các trường khác như:
    // - Phương thức thanh toán (paymentMethod)
    // - Thông tin chi tiết giao dịch (ví dụ: JSON data)
  }