import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BlogsService } from './blog.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Blogs')
@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogService: BlogsService) {}

  @Public()
  @Get()
  async findAllBlogs() {
    return this.blogService.findAllBlogs();
  }

  @Public()
  @Get(':id')
  async findBlogById(@Param('id') id: string) {
    const blog = await this.blogService.findBlog(id);
    if (!blog) {
      return {
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Blog not found',
      };
    }
    return blog;
  }
}
