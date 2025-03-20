import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDecimal,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';


export class MedicationUsageDto {
    @ApiProperty({ description: 'ID của thuốc', example: 'abc123' })
    @IsString()
    medicationId: string;
  
    @ApiProperty({ description: 'Số lượng', example: 2 })
    @IsInt()
    quantity: number;
  }

export class ServiceUsedDto {
  @ApiProperty({
    description: 'ID của dịch vụ đã sử dụng',
    example: 'e5f6a7b8-c9d0-11ec-9d64-0242ac120002',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Ghi chú về dịch vụ',
    example: 'Siêu âm 4D',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCheckupDto {
  @ApiProperty({
    description: 'Cân nặng của mẹ',
    example: 60.5,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  motherWeight?: number;

  @ApiProperty({
    description: 'Huyết áp của mẹ',
    example: '120/80',
    required: false,
  })
  @IsOptional()
  @IsString()
  motherBloodPressure?: string;

  @ApiProperty({
    description: 'Tình trạng sức khỏe của mẹ',
    example: 'Bình thường',
    required: false,
  })
  @IsOptional()
  @IsString()
  motherHealthStatus?: string;

  @ApiProperty({
    description: 'Cân nặng của thai nhi',
    example: 3.2,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  fetalWeight?: number;

  @ApiProperty({
    description: 'Chiều dài của thai nhi',
    example: 50.5,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  fetalHeight?: number;

  @ApiProperty({
    description: 'Nhịp tim thai nhi',
    example: 140,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  fetalHeartbeat?: number;

  @ApiProperty({
    description: 'Cảnh báo từ bác sĩ',
    example: 'Nhịp tim hơi cao, cần theo dõi',
    required: false,
  })
  @IsOptional()
  @IsString()
  warning?: string;

  //   @ApiProperty({
  //     description: 'Danh sách dịch vụ đã thực hiện',
  //     type: [ServiceUsedDto],
  //     required: false,
  //   })
  //   @IsOptional()
  //   @IsArray()
  //   @ValidateNested({ each: true })
  //   @Type(() => ServiceUsedDto)
  //   servicesUsed?: ServiceUsedDto[];

  @ApiProperty({
    description: 'Danh sách thuốc được kê',
    type: [MedicationUsageDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationUsageDto)
  medications: MedicationUsageDto[];
}


