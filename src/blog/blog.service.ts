import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) { }

  async createBlog(model: CreateBlogDto, user): Promise<Blog> {
    if (!model) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
    }
    if (isEmptyObject(model)) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Model data is empty');
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
    const newBlog = this.blogRepository.create({
      ...model,
      user: user,
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
    console.log(searchCondition);
    const { categoryId, isPublished } = searchCondition;
    const { pageNum, pageSize } = model.pageInfo;
    const query = this.blogRepository.createQueryBuilder('blog');

    // if (categoryId) {
    //   query.andWhere('blog.categoryId = :categoryId', { categoryId });
    // }

    query.andWhere('blog.isPublished = :isPublished', {
      isPublished,
    });

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
    return await this.blogRepository.findOne({ where: { id } });
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

    // Chỉ cập nhật các trường được truyền vào
    const updatedBlog = Object.assign(blog, model, { updatedAt: new Date() });

    return await this.blogRepository.save(updatedBlog);
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blog = await this.getBlog(id);
    if (!blog) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        `A blog with this id: "${id}" not exists`,
      );
    }
    await this.blogRepository.update(id, { isPublished: 0 });
    return true;
  }
}
