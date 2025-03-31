import { IsNotEmpty, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  paymentGatewayReference?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  userPackageId?: string;

  @IsOptional()
  @IsUUID()
  serviceBillingId?: string; // Thay appointmentId bằng serviceBillingId
}