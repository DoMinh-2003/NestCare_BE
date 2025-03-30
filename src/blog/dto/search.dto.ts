import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export default class SearchBlogDto {
  constructor(
    categoryId: string = '',
    isPublished: number = 1,
    authorId: string = '',
    title: string = '',
  ) {
    this.categoryId = categoryId;
    this.isPublished = isPublished;
    this.authorId = authorId;
    this.title = title;
  }

  @ApiPropertyOptional({ example: '1d75cd86-c952-443c-86ef-7c4ef238b44e' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'dde53461-99d8-4ab2-b8fd-7c0d39e075be' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  isPublished?: number;

  @ApiPropertyOptional({ example: 'blog title here' })
  @IsOptional()
  @IsString()
  title?: string;
}
