import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsArray, ArrayMinSize, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class FetalRecordAppointment {
  @ApiProperty({ description: 'ID của hồ sơ thai nhi', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  fetalRecordId: string;
}

export class BookAppointmentDto {
  @ApiProperty({ description: 'Danh sách hồ sơ thai nhi', type: [FetalRecordAppointment] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FetalRecordAppointment)
  fetalRecordIds: FetalRecordAppointment[];

  @ApiProperty({ description: 'ID của bác sĩ', example: '7f3a14b8-12a4-4bdf-8f9f-df23d89134d9' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Ngày hẹn khám', example: '2025-03-20' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'ID của slot', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  slotId: string;
}