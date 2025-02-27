import { HttpStatus, Injectable } from '@nestjs/common';
import CreateServicesDto from './dto/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from './services.entity';
import { Not, Repository } from 'typeorm';
import { CustomHttpException } from 'src/common/exceptions';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import SearchWithPaginationDto from './dto/searchWithPagination.dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import SearchServicesDto from './dto/search.dto';
import UpdateServiceDto from './dto/update.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
  ) {}

  async createService(model: CreateServicesDto) {
   
  if (isEmptyObject(model)) {
    throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Model data is empty');
  }

    const existingPackage = await this.servicesRepository.findOne({
      where: { name: model.name },
    });
    if (existingPackage) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `A service with this name: "${model.name}" already exists`,
      );
    }
    const newPackage = this.servicesRepository.create({
      ...model,
    });
    return await this.servicesRepository.save(newPackage);
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

      query.orderBy('services.createdAt', 'DESC');

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

  async getService(id: string): Promise<Services | null> {
      return await this.servicesRepository.findOne({
        where: { id, isDeleted: 0 },
      });
      }

  async updateService(id: string, model: UpdateServiceDto, user): Promise<Services> {
          
          const service = await this.getService(id);
      
          if (!service) {
            throw new CustomHttpException(
              HttpStatus.NOT_FOUND,
              `A service with this id: "${id}" does not exist`,
            );
          }
      
          if (model.name) {
            const existingService = await this.servicesRepository.findOne({
              where: { name: model.name, id: Not(id) },
            });
            if (existingService) {
              throw new CustomHttpException(
                HttpStatus.BAD_REQUEST,
                `A serivce with name "${model.name}" already exists.`,
              );
            }
          }
      
          // Chỉ cập nhật các trường được truyền vào
          const updatedService = Object.assign(service, model, { updatedAt: new Date() });
      
          return await this.servicesRepository.save(updatedService);
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
