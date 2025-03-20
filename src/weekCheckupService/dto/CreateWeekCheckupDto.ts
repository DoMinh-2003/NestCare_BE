import { IsNotEmpty, IsNumber, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeekCheckupDto {
  @ApiProperty({ example: 12, description: 'Số tuần của lần khám' })
  @IsNumber()
  @IsNotEmpty()
  week: number;

  @ApiProperty({ example: 'Khám tổng quát', description: 'Tiêu đề của lần khám' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Cần xét nghiệm máu, siêu âm...', description: 'Mô tả lần khám' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], description: 'Danh sách ID các dịch vụ' })
  @IsArray()
  @IsUUID('4', { each: true })
  serviceIds: string[];
}
