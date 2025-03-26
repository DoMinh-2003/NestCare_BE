import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsOptional, IsString } from "class-validator";

export class MotherHealthDTO {
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

}