import { User } from 'src/users/model/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserPackages } from '../../userPackages/entities/userPackages.entity';

export enum PregnancyStatus {
  PREGNANT = 'PREGNANT', // Đang mang thai
  BORN = 'BORN', // Đã sinh
  MISSED = 'MISSED', // Mất thai không có dấu hiệu
  STILLBIRTH = 'STILLBIRTH', // Thai chết lưu
  ABORTED = 'ABORTED', // Phá thai
  MISCARRIAGE = 'MISCARRIAGE', // Thai chết lưu tự nhiên
}

@Entity()
export class FetalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('date',{ nullable: true })
  dateOfPregnancyStart: string; // Ngày bắt đầu mang thai

  @Column('date',{ nullable: true })
  expectedDeliveryDate: string; // Ngày dự kiến sinh

  @Column('date', { nullable: true })
  actualDeliveryDate: string | null; // Ngày sinh thực tế, có thể là null nếu chưa sinh

  @Column({ nullable: true })
  healthStatus: string;

  @ManyToOne(() => User, (user) => user.fetalRecords)
  @JoinColumn({ name: 'user_id' })
  mother: User; // Mối quan hệ đến User (mẹ bầu)

//   @OneToMany(() => UserPackages, (userPackages) => userPackages.fetalRecord)
//   userPackages: UserPackages[];  // Mối quan hệ với bảng UserPackages


  @Column({
    type: 'enum',
    enum: PregnancyStatus,
    default: PregnancyStatus.PREGNANT, // Trạng thái mặc định là Đang mang thai
  })
  status: PregnancyStatus; // Trạng thái thai nhi

  @Column({ type: 'tinyint', width: 1, default: 0 })
  isDeleted: number; // Trường này để theo dõi các hồ sơ bị xóa

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
