import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    example: 'aec2c016-c4d4-42ff-a328-138e45754895',
    description: 'ID của danh mục blog',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    example: 'Top 5 mẹo chăm sóc sức khỏe mùa hè',
    description: 'Tiêu đề bài blog',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Bài viết chia sẻ những mẹo đơn giản để bảo vệ sức khỏe trong mùa hè.',
    description: 'Mô tả ngắn về bài blog',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Nội dung chi tiết của bài viết với các mẹo như uống đủ nước, mặc đồ thoáng mát, ...',
    description: 'Nội dung chi tiết của bài blog',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
