import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './model/blog.entity';
import SearchWithPaginationDto from './dto/searchWithPagination';
import { SearchPaginationResponseModel } from 'src/common/models';
import SearchBlogDto from './dto/search.dto';
import { formatPaginationResult } from 'src/utils/helpers';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

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

    const parsedIsPublished = Number(isPublished);
    if (parsedIsPublished) {
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
}
