import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateCheckupRecordDto {
  @ApiPropertyOptional({ example: 65.5, description: 'Cân nặng của mẹ (kg)' })
  @IsOptional()
  @IsNumber()
  motherWeight?: number;

  @ApiPropertyOptional({ example: '120/80', description: 'Huyết áp của mẹ' })
  @IsOptional()
  @IsString()
  motherBloodPressure?: string;

  @ApiPropertyOptional({ example: 'Sức khỏe bình thường', description: 'Tình trạng sức khỏe của mẹ' })
  @IsOptional()
  @IsString()
  motherHealthStatus?: string;

  @ApiPropertyOptional({ example: 2.5, description: 'Cân nặng thai nhi (kg)' })
  @IsOptional()
  @IsNumber()
  fetalWeight?: number;

  @ApiPropertyOptional({ example: 45, description: 'Chiều cao thai nhi (cm)' })
  @IsOptional()
  @IsNumber()
  fetalHeight?: number;

  @ApiPropertyOptional({ example: 140, description: 'Nhịp tim thai nhi (bpm)' })
  @IsOptional()
  @IsNumber()
  fetalHeartbeat?: number;

  @ApiPropertyOptional({ example: 'Không có dấu hiệu bất thường', description: 'Cảnh báo từ bác sĩ' })
  @IsOptional()
  @IsString()
  warning?: string;

  @ApiProperty({ example: '2024-03-10T08:00:00.000Z', description: 'Ngày tạo hồ sơ' })
  @IsDateString()
  createdAt: string; // Mẹ bầu tự chọn ngày tạo
}
