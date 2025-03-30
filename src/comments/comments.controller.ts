import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Comment } from './comment.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('comments')
@Controller('/api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }


  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Tạo một comment mới' })
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.createComment(createCommentDto);
    return { success: true, data: comment };
  }

  @Public()
  @Get('blog/:blogId')
  @ApiOperation({ summary: 'Lấy danh sách bình luận theo Blog ID' })
  @ApiParam({ name: 'blogId', description: 'ID của blog', example: '654a2366-5cd3-4ce4-a241-d213d4186af6' })
  @ApiResponse({ status: 200, description: 'Danh sách bình luận được trả về', type: [Comment] })
  async getCommentsByBlogId(@Param('blogId') blogId: string): Promise<Comment[]> {
    return this.commentsService.getCommentsByBlogId(blogId);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
