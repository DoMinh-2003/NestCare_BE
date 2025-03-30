import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsArray,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { DurationType } from '../entity/package.entity';

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
    description: 'Giá trị thời gian hiệu lực của gói',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @IsInt()

  durationValue?: number;

  @ApiProperty({
    description: 'Đơn vị thời gian hiệu lực của gói',
    enum: DurationType,
    example: 'DAY, WEEK, MONTH',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(DurationType)
  durationType?: DurationType;

  @ApiProperty({
    description: 'A list of services associated with the package',
    type: [PackageServiceDto],
  })
  @IsArray()
  @IsNotEmpty()
  packageService: PackageServiceDto[];
}
