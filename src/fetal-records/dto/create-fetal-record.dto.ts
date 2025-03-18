import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { PregnancyStatus } from '../entities/fetal-record.entity';

export class CreateFetalRecordDto {
  @ApiProperty({
    description: 'The name of the fetal record',
    example: 'Baby 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '1 baby or 2 baby',
    example: '1 baby or 2 baby',
  })
  @IsNotEmpty()
  @IsString()
  note: string;

  @ApiProperty({
    description: 'Ngày bắt đầu mang thai của mẹ bầu',
    example: '2025-03-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfPregnancyStart?: string; // Ngày bắt đầu mang thai

  @ApiProperty({
    description: 'Ngày dự kiến sinh của thai nhi',
    example: '2025-12-01',
  })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string; // Ngày dự kiến sinh

  @ApiProperty({
    description: 'Health status of the fetus',
    example: 'Healthy',
  })
  @IsOptional()
  @IsString()
  healthStatus: string;

  @ApiProperty({
    description: 'Pregnancy status of the fetus',
    enum: PregnancyStatus,
    example: PregnancyStatus.PREGNANT,
  })
  @IsEnum(PregnancyStatus)
  status: PregnancyStatus;

  @ApiProperty({
    description: 'The ID of the mother (User ID)',
    example: 'mother-user-id',
  })
  @IsUUID()
  motherId: string;
}
