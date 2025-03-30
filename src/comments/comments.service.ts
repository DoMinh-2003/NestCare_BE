import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/model/user.entity';
import { Blog } from 'src/blog/blog.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CustomHttpException } from 'src/common/exceptions';
import { UpdateCommentDto } from './dto/update-comment.dto';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) { }

  async createComment(dto: CreateCommentDto): Promise<Comment> {
    const { content, blogId, userId, parentId } = dto;

    // Kiểm tra user của comment mới
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Người dùng không tồn tại');
    }

    // Kiểm tra blog
    const blog = await this.blogRepository.findOne({ where: { id: blogId } });
    if (!blog) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Blog không tồn tại');
    }

    // Kiểm tra comment cha (nếu có)
    let parentComment: Comment | null = null;
    if (parentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
        relations: ['user'], // Load thông tin user của comment cha
      });
      if (!parentComment) {
        throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Comment cha không tồn tại');
      }
    }

    // Tích hợp logic kiểm tra reply từ người dùng khác
    let isDifferentUserReply = false;
    if (parentComment) {
      isDifferentUserReply = user.id !== parentComment.user.id;
      if (isDifferentUserReply) {
        console.log('Đây là reply từ một người dùng khác');
        // Bạn có thể thêm hành động khác ở đây, ví dụ: gửi thông báo
      }
    }

    // Tạo comment mới
    const newComment = this.commentRepository.create({
      content,
      user,
      blog,
      parent: parentComment || undefined,
    });

    // Lưu comment vào database
    const savedComment = await this.commentRepository.save(newComment);

    // Trả về comment đã lưu
    return savedComment;
  }

  async isReplyFromDifferentUser(commentId: string): Promise<boolean> {
    // Truy vấn comment với thông tin parent và user
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['parent', 'parent.user', 'user'], // Load quan hệ cần thiết
    });

    // Nếu comment không tồn tại hoặc không có parent, thì không phải reply
    if (!comment || !comment.parent) {
      return false;
    }

    // So sánh user của comment hiện tại và comment cha
    return comment.user.id !== comment.parent.user.id;
  }



  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
