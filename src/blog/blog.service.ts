import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './model/blog.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { CreateBlogDto, SearchBlogDto, SearchWithPaginationDto } from './dto';
import { CustomHttpException } from 'src/common/exceptions';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async createBlog(model: CreateBlogDto, user): Promise<Blog> {
    if (isEmptyObject(model)) {
      throw new HttpException('Model data is empty', HttpStatus.NOT_FOUND);
    }

    const existingBlog = await this.blogRepository.findOne({
      where: { title: model.title },
    });
    if (existingBlog) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `A blog with this title: "${model.title}" already exists`,
      );
    }
    const newBlog = this.blogRepository.create({
      ...model,
      authorId: 'bf3ffcde-e7c0-11ef-9cac-00155d808014',
    });
    return await this.blogRepository.save(newBlog);
  }

  async findBlogs(
    model: SearchWithPaginationDto,
  ): Promise<SearchPaginationResponseModel<Blog>> {
    const searchCondition = {
      ...new SearchBlogDto(),
      ...model.searchCondition,
    };
    console.log(searchCondition);
    const { categoryId, isPublished, authorId } = searchCondition;
    const { pageNum, pageSize } = model.pageInfo;
    const query = this.blogRepository.createQueryBuilder('blog');

    // if (categoryId) {
    //   query.andWhere('blog.categoryId = :categoryId', { categoryId });
    // }

    const parsedIsPublished =
      isPublished !== undefined ? Number(isPublished) : undefined;
    if (parsedIsPublished !== undefined) {
      query.andWhere('blog.isPublished = :isPublished', {
        isPublished: parsedIsPublished,
      });
    }

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

  async findBlog(id: string): Promise<Blog | null> {
    return await this.blogRepository.findOne({ where: { id } });
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blog = await this.findBlog(id);
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
