import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateBlogDto {
  constructor(
    title: string,
    categoryId: string,
    image: string,
    description: string,
    content: string,
    userId: string
  ) {
    this.title = title;
    this.categoryId = categoryId;
    this.image = image;
    this.description = description;
    this.content = content;
    this.userId = userId;
  }

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  userId: string; // Bắt buộc phải có userId

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
