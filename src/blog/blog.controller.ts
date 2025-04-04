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
  Req,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blog.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Api } from 'src/common/api';
import { formatResponse } from 'src/utils';
import { SearchPaginationResponseModel } from 'src/common/models';
import { Blog } from './blog.entity';
import {
  CreateBlogDto,
  SearchBlogDto,
  SearchWithPaginationDto,
  UpdateBlogDto,
} from './dto';
import { CustomHttpException } from 'src/common/exceptions';

@ApiTags('Blogs')
@Controller(Api.blog)
export class BlogsController {
  constructor(private readonly blogService: BlogsService) { }

  @ApiBearerAuth()
  @ApiBody({ type: CreateBlogDto })
  @Post('create')
  async createBlog(@Body() model: CreateBlogDto, @Request() req) {
    console.log(model, req.user);
    const blog = await this.blogService.createBlog(model, req.user);
    return formatResponse<Blog>(blog);
  }

  @Public()
  @ApiBody({ type: SearchWithPaginationDto })
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async getBlogs(@Body() model: SearchWithPaginationDto) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }
    const blogs: SearchPaginationResponseModel<Blog> =
      await this.blogService.getBlogs(model);
    return formatResponse<SearchPaginationResponseModel<Blog>>(blogs);
  }

  @Public()
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const blog = await this.blogService.getBlog(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return formatResponse<Blog>(blog);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBlogDto })
  async updateBlog(
    @Param('id') id: string,
    @Body() model: UpdateBlogDto,
    @Req() req,
  ) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        'You need to send data',
      );
    }
    const blog = await this.blogService.updateBlog(id, model, req.user);
    return formatResponse<Blog>(blog);
  }

  @Public()
  @ApiBearerAuth()
  @Delete(':id')
  async deleteBlog(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    const result = await this.blogService.deleteBlog(id, userId);
    return formatResponse<boolean>(result);
  }
}
