import { Module } from '@nestjs/common';
import { BlogsService } from './blog.service';
import { BlogsController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { CategoryModule } from 'src/category/category.module';
import { UsersModule } from 'src/users/users.module';
import { Category } from 'src/category/category.entity';
import { User } from 'src/users/model/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Category, User]),
    CategoryModule,
    UsersModule,
  ],
  providers: [BlogsService],
  controllers: [BlogsController],
  exports: [BlogsService],
})
export class BlogsModule { }
