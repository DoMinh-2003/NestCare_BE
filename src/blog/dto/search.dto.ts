import { IsInt, IsString } from 'class-validator';

export default class SearchBlogDto {
  constructor(
    categoryId: string = '',
    isPublished: number = 1,
    authorId: string = '',
  ) {
    this.categoryId = categoryId;
    this.isPublished = isPublished;
    this.authorId = authorId;
  }

  @IsString()
  public categoryId: string;

  @IsString()
  public authorId: string;

  @IsInt()
    isPublished: number;
}
