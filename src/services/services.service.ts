import { HttpStatus, Injectable } from '@nestjs/common';
import CreateServicesDto from './dto/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from './services.entity';
import { Repository } from 'typeorm';
import { CustomHttpException } from 'src/common/exceptions';
import { isEmptyObject } from 'src/utils/helpers';

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
  findAll() {
    return this.servicesRepository.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
