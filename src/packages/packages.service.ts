import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from 'src/common/exceptions';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Packages } from './package.entity';
import { CreatePackageDto, SearchPackagesDto, SearchWithPaginationDto, UpdatePackageDto } from './dto';
import { SearchPaginationResponseModel } from 'src/common/models';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
  ) {}
  async createPackage(model: CreatePackageDto) {
    if (isEmptyObject(model)) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Model data is empty',
      );
    }

    const existingPackage = await this.packagesRepository.findOne({
      where: { name: model.name },
    });
    if (existingPackage) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `A package with this name: "${model.name}" already exists`,
      );
    }
    const newPackage = this.packagesRepository.create({
      ...model,
    });

    return await this.packagesRepository.save(newPackage);
  }

  async getPackages(
    model: SearchWithPaginationDto,
  ): Promise<SearchPaginationResponseModel<Packages>> {
    const searchCondition = {
      ...new SearchPackagesDto(),
      ...model.searchCondition,
    };
    console.log(searchCondition);
    const { keyword, isDeleted } = searchCondition;
    const { pageNum, pageSize } = model.pageInfo;
    const query = this.packagesRepository.createQueryBuilder('packages');

    if (keyword) {
      query.andWhere('packages.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    query.andWhere('packages.isDeleted = :isDeleted', {
      isDeleted,
    });

    query.orderBy('packages.createdAt', 'DESC');

    query.skip((pageNum - 1) * pageSize).take(pageSize);

    const [packages, total] = await query.getManyAndCount();
    const data = new SearchPaginationResponseModel<Packages>();
    const result = formatPaginationResult<Packages>(data, packages, {
      pageNum,
      pageSize,
      totalItems: total,
      totalPages: 0,
    });

    return result;
  }

  async getPackage(id: string): Promise<Packages | null> {
    return await this.packagesRepository.findOne({
      where: { id, isDeleted: 0 },
    });
  }

  async updatePackage(id: string, model: UpdatePackageDto, user): Promise<Packages> {
            
            const item = await this.getPackage(id);
        
            if (!item) {
              throw new CustomHttpException(
                HttpStatus.NOT_FOUND,
                `A package with this id: "${id}" does not exist`,
              );
            }
        
            if (model.name) {
              const existingPackage = await this.packagesRepository.findOne({
                where: { name: model.name, id: Not(id) },
              });
              if (existingPackage) {
                throw new CustomHttpException(
                  HttpStatus.BAD_REQUEST,
                  `A package with name "${model.name}" already exists.`,
                );
              }
            }
        
            // Chỉ cập nhật các trường được truyền vào
            const updatedPackage = Object.assign(item, model, { updatedAt: new Date() });
        
            return await this.packagesRepository.save(updatedPackage);
          }

  async deletePackage(id: string): Promise<boolean> {
    const item = await this.getPackage(id);
    if (!item) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        `A package with this id: "${id}" not exists`,
      );
    }
    await this.packagesRepository.update(id, { isDeleted: 1 });
    return true;
  }
}
