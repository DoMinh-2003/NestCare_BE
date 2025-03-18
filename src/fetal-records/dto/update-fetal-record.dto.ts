import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { PregnancyStatus } from '../entities/fetal-record.entity';

export class UpdateFetalRecordDto {
  @ApiProperty({
    description: 'Tên của thai nhi',
    example: 'Thai nhi 1',
  })
  @IsOptional()  // Cho phép không truyền dữ liệu nếu không cần cập nhật
  @IsString()
  name?: string;

  @ApiProperty({
    description: '1 baby or 2 baby',
    example: '1 baby or 2 baby',
  })
  @IsOptional() 
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu mang thai của mẹ bầu',
    example: '2025-03-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfPregnancyStart?: string;  // Ngày bắt đầu mang thai

  @ApiProperty({
    description: 'Ngày dự kiến sinh của thai nhi',
    example: '2025-12-01',
  })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;  // Ngày dự kiến sinh

  @ApiProperty({
    description: 'Ngày sinh thực tế của thai nhi',
    example: '2025-09-01',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;  // Trường mới cho ngày sinh thực tế

  @ApiProperty({
    description: 'Tình trạng sức khỏe của thai nhi',
    example: 'Khỏe mạnh',
  })
  @IsOptional()
  @IsString()
  healthStatus?: string;

  @ApiProperty({
    description: 'Trạng thái của thai nhi',
    enum: PregnancyStatus,  // Enum PregnancyStatus
    example: "PREGNANT, BORN, MISSED, STILLBIRTH, ABORTED, MISCARRIAGE",  // Trạng thái mặc định là PREGNANT
  })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;

}
