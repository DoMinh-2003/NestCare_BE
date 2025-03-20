import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, Validate } from 'class-validator';
import { StartBeforeEndDate, StartDateInFuture } from '../validators/reminder-date.validator';

export class CreateReminderDto {
    @ApiProperty({ description: 'ID của mẹ bầu', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty()
    motherId: string;
  
    @ApiProperty({ description: 'Tiêu đề của nhắc nhở', example: 'Khám thai tuần 12' })
    @IsNotEmpty()
    title: string;
  
    @ApiProperty({ description: 'Mô tả chi tiết', example: 'Mẹ bầu cần đi khám thai để kiểm tra thai nhi.' })
    @IsNotEmpty()
    description: string;
  
    @ApiProperty({ description: 'Giờ nhắc nhở (HH:mm)', example: '08:30' })
    @IsNotEmpty()
    reminderTime: string;
  
    @ApiProperty({ description: 'Ngày bắt đầu (YYYY-MM-DD)', example: '2025-06-01' })
    @IsNotEmpty()
    @IsDateString()
    @Validate(StartDateInFuture)
    startDate: string;
  
    @ApiProperty({ description: 'Ngày kết thúc (YYYY-MM-DD)', example: '2025-06-30' })
    @IsNotEmpty()
    @IsDateString()
    @Validate(StartBeforeEndDate, ['endDate'])
    endDate: string;
  }
  