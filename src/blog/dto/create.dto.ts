import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
} from 'class-validator';

export default class CreateBlogDto {
  constructor(
    title: string,
    categoryId: string,
    description: string,
    content: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    isPublished: number = 1,
  ) {
    this.title = title;
    this.categoryId = categoryId;
    this.description = description;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isPublished = isPublished;
  }

  @IsNotEmpty()
  @IsString()
  public categoryId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsDate()
  public createdAt: Date;

  @IsDate()
  public updatedAt: Date;

  @IsOptional()
  @IsInt()
  isPublished?: number;
}
