import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export default class UpdateServiceDto {
    constructor(
        name: string,
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
