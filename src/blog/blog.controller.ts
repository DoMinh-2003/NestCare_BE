import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blog.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { Api } from 'src/common/api';
import { formatResponse } from 'src/utils';
import SearchWithPaginationDto from './dto/searchWithPagination';
import { SearchPaginationResponseModel } from 'src/common/models';
import { Blog } from './model/blog.entity';

@ApiTags('Blogs')
@Controller(Api.blog)
export class BlogsController {
  constructor(private readonly blogService: BlogsService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async getBlogs(@Body() model: SearchWithPaginationDto) {
    const blogs: SearchPaginationResponseModel<Blog> =
      await this.blogService.findBlogs(model);
    return formatResponse<SearchPaginationResponseModel<Blog>>(blogs);
  }

  @Public()
  @Get(':id')
  async findBlogById(@Param('id') id: string) {
    const blog = await this.blogService.findBlog(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return formatResponse(blog);
  }
}
