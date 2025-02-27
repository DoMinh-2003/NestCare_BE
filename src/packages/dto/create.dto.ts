import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
} from 'class-validator';

export default class CreatePackageDto {
  constructor(
    name: string = '',
    description: string = '',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    slots: number = 0,
    price: number = 0,
    isDeleted: number = 0,
  ) {
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.price = price;
    this.slots = slots;
    this.isDeleted = isDeleted;
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsInt()
  slots: number;

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
