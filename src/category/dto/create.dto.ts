import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
} from 'class-validator';

export default class CreateCategoryDto {
  constructor(
    name: string = '',
    description: string = '',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    isDeleted: number = 0,
  ) {
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isDeleted = isDeleted;
  }

  @ApiProperty({
    example: 'Sinh con',
    description: 'Nội dung chi tiết của bài blog',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Sinh con đang phát triển.',
    description: 'Mô tả chi tiết của bài blog',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  public createdAt: Date;

  @IsDate()
  public updatedAt: Date;

  @IsOptional()
  @IsInt()
  isDeleted?: number;
}
