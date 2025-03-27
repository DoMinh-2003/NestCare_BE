import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/model/user.entity';
import { Blog } from 'src/blog/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Blog])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [TypeOrmModule],
})
export class CommentsModule { }
