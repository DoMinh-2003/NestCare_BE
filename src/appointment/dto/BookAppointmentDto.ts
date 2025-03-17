import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class BookAppointmentDto {
  @ApiProperty({ description: 'ID của hồ sơ thai nhi', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  fetalRecordId: string;

  @ApiProperty({ description: 'ID của bác sĩ', example: '7f3a14b8-12a4-4bdf-8f9f-df23d89134d9' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Ngày hẹn khám', example: '2025-03-20T10:00:00.000Z' })
  @IsDateString()
  date: string;
}
