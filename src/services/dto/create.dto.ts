import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
} from 'class-validator';

export default class CreateServicesDto {
  constructor(
    name: string = '',
    description: string = '',
    price: number = 0,
  ) {
    this.name = name;
    this.description = description;
    this.price = price;
  }

  @ApiProperty({
    description: 'The name of the product',
    example: 'Product Name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Product Description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  
  @ApiProperty({
    description: 'The price of the product',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  price: number;

 
}
