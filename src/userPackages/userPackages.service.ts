import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/model/user.entity';
import { Packages } from 'src/packages/entity/package.entity';
import { UserPackages, UserPackageStatus } from './entities/userPackages.entity';
import { VnpayService } from 'src/common/service/vnpay.service';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { UserPackageServiceUsage } from 'src/users/model/userPackageServiceUsage.entity';

@Injectable()
export class UserPackagesService {
  constructor(
    @InjectRepository(UserPackages)
    private userPackagesRepository: Repository<UserPackages>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    // @InjectRepository(FetalRecord)
    // private fetalRecordRepository: Repository<FetalRecord>,

    @InjectRepository(Packages)
    private packagesRepository: Repository<Packages>,

    @InjectRepository(UserPackageServiceUsage)
    private userPackageServiceUsageRepository: Repository<UserPackageServiceUsage>,

    

    private vnpayService: VnpayService, // Inject VnpayService vào constructor
  ) {}

  // Mua gói dịch vụ cho thai nhi
  async purchasePackage(userId: string, packageId: string ) {
    const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      
      
      const packageEntity = await this.packagesRepository.findOne({
        where: { id: packageId },
        relations: ['packageServices']
      });
      
    if (!user || !packageEntity) {
      throw new Error('User or Package not found');
    }

    const userPackage = this.userPackagesRepository.create({
      user,
    //   fetalRecord,
      package: packageEntity,
      isActive: true,
    });


 


    const newUserPackage  = await this.userPackagesRepository.save(userPackage)
    const param = `?order=${newUserPackage.id}`
    const amount = userPackage.package.price * 100;
    
    return await this.vnpayService.createPayment(newUserPackage.id,param,amount);
  }

  // Lấy các gói dịch vụ của mẹ bầu
//   async getUserPackagesForFetalRecord(fetalRecordId: string): Promise<UserPackages[]> {
//     return this.userPackagesRepository.find({
//       where: { fetalRecord: { id: fetalRecordId }, isDeleted: false },
//       relations: ['package', 'user'],  // Đảm bảo lấy thông tin gói dịch vụ và user
//     });
//   }

   // Lấy tất cả các gói dịch vụ của một user (mẹ bầu)
   async getUserPackagesByUser(userId: string): Promise<UserPackages[]> {
    return this.userPackagesRepository.find({
      where: { user: { id: userId }, isDeleted: false, isActive: false},
      relations: ['package', 'user'],  // Lấy thông tin gói dịch vụ và thai nhi
    });
  }



   // Lấy các gói dịch vụ theo trạng thái
   async getUserPackagesByStatus(status: UserPackageStatus): Promise<UserPackages[]> {
    return this.userPackagesRepository.find({
      where: { status, isDeleted: false },
      relations: ['package', 'user'], // Lấy thông tin gói dịch vụ, thai nhi, và người dùng
    });
  }
    
      // // Thay đổi trạng thái của gói dịch vụ
      // async changeStatus(id: string, newStatus: UserPackageStatus): Promise<UserPackages> {
      //   const userPackage = await this.userPackagesRepository.findOne({ where: { id: id }});
      //   if (!userPackage) {
      //     throw new Error('UserPackage not found');
      //   }
    
      //   userPackage.status = newStatus;
      //   return await this.userPackagesRepository.save(userPackage);
      // }

      async changeStatus(id: string, newStatus: UserPackageStatus): Promise<UserPackages> {
        const userPackage = await this.userPackagesRepository.findOne({
          where: { id: id },
          relations: ['user', 'package', 'package.packageServices','package.packageServices.service'],
        });
      
        if (!userPackage) {
          throw new Error('UserPackage not found');
        }
      
        userPackage.status = newStatus;
      
        // 🔹 Nếu trạng thái là PAID thì tạo `UserPackageServiceUsage`
        if (UserPackageStatus.PAID.toLocaleLowerCase == newStatus.toLocaleLowerCase) {
          const user = userPackage.user;
          const packageServices = userPackage.package.packageServices;
      
          // Map dịch vụ sang UserPackageServiceUsage
          const userServiceUsages = await Promise.all(
            packageServices.map(async (servicePackage) => {
              const existingUsage = await this.userPackageServiceUsageRepository.findOne({
                where: { user: { id: user.id }, service: { id: servicePackage.service.id } },
              });
          
              if (existingUsage) {
                // Nếu đã tồn tại, cập nhật số lượt
                existingUsage.slot += servicePackage.slot;
                return this.userPackageServiceUsageRepository.save(existingUsage);
              } else {
                // Nếu chưa có, tạo mới
                return this.userPackageServiceUsageRepository.create({
                  user,
                  service: servicePackage.service,
                  slot: servicePackage.slot,
                  order: userPackage,
                });
              }
            })
          );
          
          // Lưu tất cả các bản ghi mới hoặc cập nhật
          await this.userPackageServiceUsageRepository.save(userServiceUsages);

          userPackage.isActive = true; // Kích hoạt gói sau khi thanh toán
        }
      
        return await this.userPackagesRepository.save(userPackage);
      }
      


      async getAllUserPackages(
        status?: string,
        packageName?: string,
        options: IPaginationOptions = { page: 1, limit: 10 }, // Đảm bảo options luôn có giá trị
      ): Promise<Pagination<UserPackages>> {
        const queryBuilder = this.userPackagesRepository.createQueryBuilder('userPackage')
        .leftJoinAndSelect('userPackage.package', 'package') // Join bảng Packages
        .leftJoinAndSelect('userPackage.user', 'user'); // Join bảng Users    
        // Nếu có filter theo status
        if (status) {
          queryBuilder.andWhere('userPackage.status = :status', { status });
        }
    
        // Nếu có filter theo package name
        if (packageName) {
          queryBuilder.andWhere('package.name LIKE :packageName', { packageName: `%${packageName}%` });
        }
    
        queryBuilder.orderBy('userPackage.createdAt', 'DESC');
    
        return paginate<UserPackages>(queryBuilder, options);
      }
}
