import { HttpStatus, Injectable } from '@nestjs/common';
import CreateServicesDto from './dto/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from './services.entity';
import { Repository } from 'typeorm';
import { CustomHttpException } from 'src/common/exceptions';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import SearchWithPaginationDto from './dto/searchWithPagination.dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import SearchServicesDto from './dto/search.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
  ) {}

  async createService(model: CreateServicesDto) {
    if(!model){
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
  }
  if (isEmptyObject(model)) {
    throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Model data is empty');
  }

    const existingCategory = await this.servicesRepository.findOne({
      where: { name: model.name },
    });
    if (existingCategory) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `A service with this name: "${model.name}" already exists`,
      );
    }
    const newCategory = this.servicesRepository.create({
      ...model,
    });
    return await this.servicesRepository.save(newCategory);
  }
  async getSevices(
      model: SearchWithPaginationDto,
    ): Promise<SearchPaginationResponseModel<Services>> {
      const searchCondition = {
        ...new SearchServicesDto(),
        ...model.searchCondition,
      };
      console.log(searchCondition);
      const { keyword, isDeleted } = searchCondition;
      const { pageNum, pageSize } = model.pageInfo;
      const query = this.servicesRepository.createQueryBuilder('services');
  
      if (keyword) {
        query.andWhere('services.name LIKE :keyword', {
          keyword: `%${keyword}%`,
        });
      }
  
      query.andWhere('services.isDeleted = :isDeleted', {
        isDeleted,
      });
      query.skip((pageNum - 1) * pageSize).take(pageSize);
  
      const [services, total] = await query.getManyAndCount();
      const data = new SearchPaginationResponseModel<Services>();
      const result = formatPaginationResult<Services>(data, services, {
        pageNum,
        pageSize,
        totalItems: total,
        totalPages: 0,
      });
  
      return result;
    }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto) {
    return `This action updates a #${id} service`;
  }

  async deleteService(id: string): Promise<boolean> {
    const service = id;
    if (!service) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        `A service with this id: "${id}" not exists`,
      );
    }
    await this.servicesRepository.update(id, { isDeleted: 1 });
    return true;
  }
}
