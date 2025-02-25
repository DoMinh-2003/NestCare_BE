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
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    price: number = 0,
    isDeleted: number = 0,
  ) {
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.price = price;
    this.isDeleted = isDeleted;
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsDate()
  public createdAt: Date;

  @IsDate()
  public updatedAt: Date;

  @IsNotEmpty()
  @IsInt()
  price: number;

  @IsOptional()
  @IsInt()
  isDeleted?: number;
}
