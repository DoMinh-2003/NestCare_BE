import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class CreateMedicationDto {
  constructor(
    name: string = '',
    description: string = '',
    dosage: string = '',
    price: number = 0,
  ) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.dosage = dosage;
  }

  @ApiProperty({ example: 'Paracetamol', description: 'Tên thuốc' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Thuốc giảm đau, hạ sốt', description: 'Mô tả thuốc' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '500mg', description: 'Liều lượng thuốc' })
  @IsString()
  dosage: string;

  @ApiProperty({ example: 50000, description: 'Giá thuốc', type: 'number' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;


}
