import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from './services.entity';
import { Not, Repository } from 'typeorm';
import { CustomHttpException } from 'src/common/exceptions';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { SearchPaginationResponseModel } from 'src/common/models';
import {
  CreateServicesDto,
  SearchServicesDto,
  SearchWithPaginationDto,
  UpdateServiceDto,
} from './dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
  ) {}

  // Tạo mới dịch vụ
  async createService(model: CreateServicesDto): Promise<Services> {
    if (!model.name || !model.description || !model.price) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        'All fields are required',
      );
    }

    const existingService = await this.servicesRepository.findOne({
      where: { name: model.name },
    });
    if (existingService) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `A service with this name: "${model.name}" already exists`,
      );
    }

    const newService = this.servicesRepository.create({ ...model });
    return await this.servicesRepository.save(newService);
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
    if (pageNum <= 0) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        'Page num must start with 1',
      );
    }
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
      where: { id},
    });
  }
  // Cập nhật dịch vụ
  async updateService(id: string, model: UpdateServiceDto): Promise<Services> {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        `Service with id ${id} not found`,
      );
    }

    const updatedService = Object.assign(service, model);
    return await this.servicesRepository.save(updatedService);
  }

  async deleteService(id: string,isDeleted: boolean): Promise<boolean> {
    const service = await this.getService(id);
    if (!service) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        `A service with this id: "${id}" not exists`,
      );
    }
    service.isDeleted = isDeleted; // Cập nhật trạng thái isDeleted
    await this.servicesRepository.save(service);
    return true;
  }

  // Lấy tất cả các dịch vụ
  async getServicesAdmin(): Promise<Services[]> {
      return this.servicesRepository.find();
  }

  // async getAllServicesByUser(): Promise<Services[]> {
  //   return this.servicesRepository.find({where: { isDeleted: false }});
  // }
}
