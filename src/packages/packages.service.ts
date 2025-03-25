import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from 'src/common/exceptions';
import { formatPaginationResult, isEmptyObject } from 'src/utils/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Packages } from './entity/package.entity';
import {
  CreatePackageDto,
  SearchPackagesDto,
  SearchWithPaginationDto,
  UpdatePackageDto,
} from './dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import { PackageService } from './entity/packageService.entity';
import { Services } from 'src/services/services.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,

    @InjectRepository(PackageService)
    private readonly packageServiceRepository: Repository<PackageService>,

    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
  ) { }

  async createPackage(model: CreatePackageDto): Promise<Packages> {
    // Kiểm tra xem gói dịch vụ đã tồn tại chưa
    const existingPackage = await this.packagesRepository.findOne({
      where: { name: model.name },
    });
    if (existingPackage) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `Gói với tên này "${model.name}" đã tồn tại`,
      );
    }

    // 1. Tạo package mới
    const newPackage = this.packagesRepository.create({
      name: model.name,
      description: model.description,
      price: model.price,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    });

    // Lưu package vào cơ sở dữ liệu
    const createdPackage = await this.packagesRepository.save(newPackage);

    // 2. Tạo mối quan hệ với dịch vụ
    for (const service of model.packageService) {
      const serviceEntity = await this.servicesRepository.findOne({
        where: { id: service.serviceId }, // Đảm bảo rằng bạn truyền vào đúng trường "id"
      });
      if (!serviceEntity) {
        throw new CustomHttpException(
          HttpStatus.BAD_REQUEST,
          `Service with ID: ${service.serviceId} does not exist`,
        );
      }

      const packageService = this.packageServiceRepository.create({
        package: createdPackage,
        service: serviceEntity,
        slot: service.slot,
      });

      await this.packageServiceRepository.save(packageService);
    }

    return createdPackage;
  }


  // Lấy tất cả các gói dịch vụ với các dịch vụ liên quan và slot
  async getAllPackages(): Promise<Packages[]> {
    const packages = await this.packagesRepository.find({
      where: { isDeleted: false },
      relations: ['packageServices', 'packageServices.service'],
    });

    return packages;
  }

  // async getAllPackagesByUser(): Promise<Packages[]> {
  //   const packages = await this.packagesRepository.find({
  //     where:{isDeleted: false},
  //     relations: ['packageServices', 'packageServices.service'],
  //   });

  //   return packages;
  // }

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
      where: { id },
      relations: ['packageServices', 'packageServices.service'],
    });
  }

  async updatePackage(
    id: string,
    model: UpdatePackageDto,
    user,
  ): Promise<Packages> {
    // 1. Tìm package bằng id
    const item = await this.packagesRepository.findOne({
      where: { id },
      relations: ['packageServices'], // Lấy cả mối quan hệ với dịch vụ
    });

    if (!item) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        `A package with this id: "${id}" does not exist`,
      );
    }

    // 2. Kiểm tra xem có package nào có tên giống với gói hiện tại không
    if (model.name) {
      const existingPackage = await this.packagesRepository.findOne({
        where: { name: model.name, id: Not(id) }, // Tìm tên trùng nhưng ID khác
      });
      if (existingPackage) {
        throw new CustomHttpException(
          HttpStatus.BAD_REQUEST,
          `A package with name "${model.name}" already exists.`,
        );
      }
    }

    // 3. Chỉ cập nhật các trường được truyền vào
    this.packagesRepository.merge(item, model);
    const updatedPackage = await this.packagesRepository.save(item);

    // 4. Cập nhật các dịch vụ liên kết nếu cần thiết
    if (model.packageService) {
      for (const service of model.packageService) {
        const existingService = await this.packageServiceRepository.findOne({
          where: {
            package: updatedPackage,
            service: { id: service.serviceId },
          },
        });
        if (existingService) {
          existingService.slot = service.slot; // Cập nhật số slot
          await this.packageServiceRepository.save(existingService);
        } else {
          const serviceEntity = await this.servicesRepository.findOne({
            where: { id: service.serviceId }, // Đảm bảo rằng bạn truyền vào đúng trường "id"
          });
          if (!serviceEntity) {
            throw new CustomHttpException(
              HttpStatus.BAD_REQUEST,
              `Service with ID: ${service.serviceId} does not exist`,
            );
          }

          const newPackageService = this.packageServiceRepository.create({
            package: updatedPackage,
            service: serviceEntity,
            slot: service.slot,
          });
          await this.packageServiceRepository.save(newPackageService);
        }
      }
    }

    return updatedPackage;
  }

  async deletePackage(id: string, isDeleted: boolean): Promise<boolean> {
    const item = await this.getPackage(id);
    if (!item) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        `A package with this id: "${id}" not exists`,
      );
    }
    await this.packagesRepository.update(id, { isDeleted: isDeleted });
    return true;
  }
}
