import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './category.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { CustomHttpException } from 'src/common/exceptions';
import { CreateCategoryDto, SearchCategoryDto, SearchWithPaginationDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createCategory(model: CreateCategoryDto, user): Promise<Category> {
    if(!model){
        throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
    }
      if (isEmptyObject(model)) {
        throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Model data is empty');
      }
  
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: model.name },
      });
      if (existingCategory) {
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          `A category with this title: "${model.name}" already exists`,
        );
      }
      const newCategory = this.categoryRepository.create({
        ...model,
      });
      return await this.categoryRepository.save(newCategory);
    }

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

  async getCategory(id: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { id, isDeleted: 0 },
    });
    }

    async updateCategory(id: string, model: UpdateCategoryDto, user): Promise<Category> {
        if(!model){
            throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
        }
        const category = await this.getCategory(id);
    
        if (!category) {
          throw new CustomHttpException(
            HttpStatus.NOT_FOUND,
            `A category with this id: "${id}" does not exist`,
          );
        }
    
        if (model.name) {
          const existingCategory = await this.categoryRepository.findOne({
            where: { name: model.name, id: Not(id) },
          });
          if (existingCategory) {
            throw new CustomHttpException(
              HttpStatus.BAD_REQUEST,
              `A category with title "${model.name}" already exists.`,
            );
          }
        }
    
        // Chỉ cập nhật các trường được truyền vào
        const updatedCategory = Object.assign(category, model, { updatedAt: new Date() });
    
        return await this.categoryRepository.save(updatedCategory);
      }

    async deleteCategory(id: string): Promise<boolean> {
        const category = await this.getCategory(id);
        if (!category) {
          throw new CustomHttpException(
            HttpStatus.BAD_REQUEST,
            `A category with this id: "${id}" not exists`,
          );
        }
        await this.categoryRepository.update(id, { isDeleted: 1 });
        return true;
      }
}
