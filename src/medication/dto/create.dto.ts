import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
  IsNumber,
} from 'class-validator';

export default class CreateMedicationDto {
  constructor(
    name: string = '',
    description: string = '',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    dosage: string = '',
    price: number = 0,
    isDeleted: number = 0,
  ) {
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.price = price;
    this.dosage = dosage;
    this.isDeleted = isDeleted;
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  dosage: string;

  @IsDate()
  public createdAt: Date;

  @IsDate()
  public updatedAt: Date;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @IsOptional()
  @IsInt()
  isDeleted?: number;
}
