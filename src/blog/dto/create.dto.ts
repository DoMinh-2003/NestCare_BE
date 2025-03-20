import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export default class CreateBlogDto {
  constructor(
    title: string,
    categoryId: string,
    description: string,
    content: string,
  ) {
    this.title = title;
    this.categoryId = categoryId;
    this.description = description;
    this.content = content;
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
}
