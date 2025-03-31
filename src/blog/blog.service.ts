import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import {
  CreateBlogDto,
  SearchBlogDto,
  SearchWithPaginationDto,
  UpdateBlogDto,
} from './dto';
import { CustomHttpException } from 'src/common/exceptions';
import { User } from 'src/users/model/user.entity';
import { Category } from 'src/category/category.entity';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(UserPackages)
    private readonly userPackagesRepository: Repository<UserPackages>,
  ) { }

  async createBlog(model: CreateBlogDto, user): Promise<Blog> {
    if (!model) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
    }
    if (isEmptyObject(model)) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Model data is empty');
    }

    // Kiểm tra xem user đã mua gói dịch vụ hay chưa
    const hasPurchasedPackage = await this.userPackagesRepository.findOne({
      where: { user: { id: user.id }, isDeleted: false },
    });

    if (!hasPurchasedPackage) {
      throw new CustomHttpException(HttpStatus.FORBIDDEN, 'Bạn cần mua gói dịch vụ để bình luận.');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Kiểm tra số bài viết của user trong ngày
    const todayBlogCount = await this.blogRepository.count({
      where: {
        user: { id: user.id },
        createdAt: Between(startOfDay, endOfDay), // Lọc theo ngày
      },
    });

    if (todayBlogCount >= 5) {
      throw new CustomHttpException(HttpStatus.FORBIDDEN, 'Bạn chỉ có thể đăng tối đa 5 bài mỗi ngày.');
    }

    const existingBlog = await this.blogRepository.findOne({
      where: { title: model.title },
    });

    if (existingBlog) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `Blog với tiêu đề này: "${model.title}" đã tồn tại`,
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: model.categoryId },
    });

    if (!category) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Category không tồn tại');
    }

    const newBlog = this.blogRepository.create({
      ...model,
      category,
      user,
    });

    return await this.blogRepository.save(newBlog);
  }


  async getBlogs(
    model: SearchWithPaginationDto,
  ): Promise<SearchPaginationResponseModel<Blog>> {
    const searchCondition = {
      ...new SearchBlogDto(),
      ...model.searchCondition,
    };
    const { categoryId, isPublished, authorId } = searchCondition;
    const { pageNum, pageSize } = model.pageInfo;

    const query = this.blogRepository.createQueryBuilder('blog')
      .leftJoinAndSelect('blog.category', 'category')
      .leftJoinAndSelect('blog.user', 'user');

    if (categoryId) {
      query.andWhere('blog.categoryId = :categoryId', { categoryId });
    }

    if (authorId) {
      query.andWhere('blog.userId = :authorId', { authorId });
    }

    if (typeof isPublished === 'number') {
      query.andWhere('blog.isPublished = :isPublished', { isPublished });
    }

    query.orderBy('blog.createdAt', 'DESC');
    query.skip((pageNum - 1) * pageSize).take(pageSize);

    const [blogs, total] = await query.getManyAndCount();
    const data = new SearchPaginationResponseModel<Blog>();
    const result = formatPaginationResult<Blog>(data, blogs, {
      pageNum,
      pageSize,
      totalItems: total,
      totalPages: 0,
    });

    return result;
  }


  async getBlog(id: string): Promise<Blog | null> {
    return await this.blogRepository.findOne({
      where: { id },
      relations: ['category', 'user'],
    });
  }


  async updateBlog(id: string, model: UpdateBlogDto, user): Promise<Blog> {
    if (!model) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
    }

    const blog = await this.getBlog(id);

    if (!blog) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        `A blog with this id: "${id}" does not exist`,
      );
    }

    // Chỉ cho phép cập nhật nếu là chủ sở hữu
    if (blog.user.id !== user.id) {
      throw new CustomHttpException(HttpStatus.FORBIDDEN, 'Bạn không có quyền cập nhật bài viết này');
    }

    if (model.title) {
      const existingBlog = await this.blogRepository.findOne({
        where: { title: model.title, id: Not(id) },
      });
      if (existingBlog) {
        throw new CustomHttpException(
          HttpStatus.BAD_REQUEST,
          `Blog với tiêu đề này "${model.title}" đã tồn tại.`,
        );
      }
    }

    const updatedBlog = Object.assign(blog, model, { updatedAt: new Date() });

    return await this.blogRepository.save(updatedBlog);
  }


  async deleteBlog(id: string, userId: string): Promise<boolean> {
    const blog = await this.getBlog(id);
    if (!blog) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        `A blog with this id: "${id}" not exists`,
      );
    }
    if (blog.user.id !== userId) {
      throw new CustomHttpException(HttpStatus.FORBIDDEN, 'Bạn không có quyền xóa bài viết này');
    }
    await this.blogRepository.update(id, { isPublished: 0 });
    return true;
  }
}
