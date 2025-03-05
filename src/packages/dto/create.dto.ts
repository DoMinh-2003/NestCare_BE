import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsArray,
  IsUUID,
} from 'class-validator';

class PackageServiceDto {
  @ApiProperty({
    description: 'ID of the service',
    example: 'service-id-1',
  })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'The number of slots for the service',
    example: 5,
  })
  @IsNotEmpty()
  @IsInt()
  slot: number;
}

export default class CreatePackageDto {
  @ApiProperty({
    description: 'The name of the package',
    example: 'Premium Package',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the package',
    example: 'This package includes premium services.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The price of the package',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  price: number;

  @ApiProperty({
    description: 'A list of services associated with the package',
    type: [PackageServiceDto],
  })
  @IsArray()
  @IsNotEmpty()
  packageService: PackageServiceDto[];
}
