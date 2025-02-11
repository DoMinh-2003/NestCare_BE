import { IsBoolean, IsString } from 'class-validator';

export default class SearchBlogDto {
  constructor(
    categoryId: string = '',
    isPublished: boolean = false,
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

  @IsBoolean()
  public isPublished: boolean;
}
