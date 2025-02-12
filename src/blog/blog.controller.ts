import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blog.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { Api } from 'src/common/api';
import { formatResponse } from 'src/utils';
import { SearchPaginationResponseModel } from 'src/common/models';
import { Blog } from './model/blog.entity';
import { CreateBlogDto, SearchWithPaginationDto } from './dto';

@ApiTags('Blogs')
@Controller(Api.blog)
export class BlogsController {
  constructor(private readonly blogService: BlogsService) {}

  @ApiBearerAuth()
  @Public()
  @Post('create')
  async createBlog(@Body() model: CreateBlogDto, @Request() req) {
    console.log(model, req.user);
    const blog = await this.blogService.createBlog(model, req.user);
    return formatResponse<Blog>(blog);
  }

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
    return formatResponse<Blog>(blog);
  }

  @Public()
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    const result = await this.blogService.deleteBlog(id);
    return formatResponse<boolean>(result);
  }
}
