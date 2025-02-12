import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './category.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { CustomHttpException } from 'src/common/exceptions';
import { SearchCategoryDto, SearchWithPaginationDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategories(
    model: SearchWithPaginationDto,
  ): Promise<SearchPaginationResponseModel<Category>> {
    const searchCondition = {
      ...new SearchCategoryDto(),
      ...model.searchCondition,
    };
    console.log(searchCondition);
    const { keyword, isDeleted } = searchCondition;
    const { pageNum, pageSize } = model.pageInfo;
    const query = this.categoryRepository.createQueryBuilder('category');

    if (keyword) {
      query.andWhere('category.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    query.andWhere('category.isDeleted = :isDeleted', {
      isDeleted,
    });
    query.skip((pageNum - 1) * pageSize).take(pageSize);

    const [categories, total] = await query.getManyAndCount();
    const data = new SearchPaginationResponseModel<Category>();
    const result = formatPaginationResult<Category>(data, categories, {
      pageNum,
      pageSize,
      totalItems: total,
      totalPages: 0,
    });

    return result;
  }
}
