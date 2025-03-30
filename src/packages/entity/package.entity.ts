import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { PackageService } from './packageService.entity';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';

// export enum PeriodType {
//   WEEKLY = 'WEEKLY',
//   FULL_PREGNANCY = 'FULL_PREGNANCY',
//   TRIMESTER = 'TRIMESTER',
// }

export enum DurationType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

@Entity()
export class Packages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  // @Column({
  //   type: 'enum',
  //   enum: PeriodType,
  // })
  // period: PeriodType;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  delivery_included: number;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  alerts_included: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'int', nullable: true, comment: 'Giá trị thời gian hiệu lực' })
  durationValue?: number;

  @Column({
    type: 'enum',
    enum: DurationType,
    nullable: true,
    comment: 'Đơn vị thời gian hiệu lực',
  })
  durationType?: DurationType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PackageService, (packageService) => packageService.package)
  packageServices: PackageService[];

  @OneToMany(() => UserPackages, (userPackages) => userPackages.package)
  userPackages: UserPackages[]; // Mối quan hệ với bảng UserPackages (người dùng mua gói)
}
