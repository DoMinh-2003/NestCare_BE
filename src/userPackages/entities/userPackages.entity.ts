import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/model/user.entity';
// import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { Packages } from 'src/packages/entity/package.entity';
import { UserPackageServiceUsage } from 'src/users/model/userPackageServiceUsage.entity';

// Enum cho trạng thái của gói dịch vụ
export enum UserPackageStatus {
  PENDING = 'PENDING', // Đang chờ
  PAID = 'PAID', // Đã thanh toán
  COMPLETED = 'COMPLETED', // Đã hoàn tất
  CANCELED = 'CANCELED', // Đã hủy
}

@Entity('orders')
export class UserPackages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userPackages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Packages, (packageEntity) => packageEntity.userPackages)
  @JoinColumn({ name: 'package_id' })
  package: Packages; // Mối quan hệ với bảng Packages

  @Column({
    type: 'enum',
    enum: UserPackageStatus,
    default: UserPackageStatus.PENDING, // Trạng thái mặc định là "Pending"
  })
  status: UserPackageStatus; // Trạng thái của gói dịch vụ

  @Column({ type: 'boolean', default: false })
  isActive: boolean; // Trạng thái sử dụng gói dịch vụ (active hay không)

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean; // Trạng thái xóa (nếu gói dịch vụ bị hủy)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserPackageServiceUsage, (usage) => usage.order)
  serviceUsages: UserPackageServiceUsage[]; // Các lượt sử dụng dịch vụ thuộc về đơn hàng này
}
