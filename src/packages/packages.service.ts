import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdatePackageDto } from './dto/update-package.dto';
import CreatePackageDto from './dto/create.dto';
import { CustomHttpException } from 'src/common/exceptions';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Packages } from './package.entity';
import { SearchPackagesDto, SearchWithPaginationDto } from './dto';
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

  findOne(id: number) {
    return `This action returns a #${id} package`;
  }

  update(id: number, updatePackageDto: UpdatePackageDto) {
    return `This action updates a #${id} package`;
  }

  remove(id: number) {
    return `This action removes a #${id} package`;
  }
}
