import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/model/user.entity';
import { Packages } from 'src/packages/entity/package.entity';
import { UserPackages, UserPackageStatus } from './entities/userPackages.entity';
import { VnpayService } from 'src/common/service/vnpay.service';

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

    private vnpayService: VnpayService, // Inject VnpayService vào constructor
  ) {}

  // Mua gói dịch vụ cho thai nhi
  async purchasePackage(userId: string, packageId: string ) {
    const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      
    //   const fetalRecord = await this.fetalRecordRepository.findOne({
    //     where: { id: fetalRecordId },
    //   });
      
      const packageEntity = await this.packagesRepository.findOne({
        where: { id: packageId },
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
      where: { user: { id: userId }, isDeleted: false },
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
    
      // Thay đổi trạng thái của gói dịch vụ
      async changeStatus(id: string, newStatus: UserPackageStatus): Promise<UserPackages> {
        const userPackage = await this.userPackagesRepository.findOne({ where: { id: id }});
        if (!userPackage) {
          throw new Error('UserPackage not found');
        }
    
        userPackage.status = newStatus;
        return await this.userPackagesRepository.save(userPackage);
      }
}
