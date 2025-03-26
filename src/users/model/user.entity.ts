import { Entity, Column, BeforeInsert, PrimaryColumn, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { v4 as uuidv4 } from 'uuid';
import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { UserPackages } from 'src/userPackages/entities/userPackages.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Reminder } from 'src/reminder/entities/reminder.entity';
import { UserPackageServiceUsage } from './userPackageServiceUsage.entity';
import { Blog } from 'src/blog/blog.entity';
import { AppointmentHistory } from 'src/appointment/entities/appointmentHistory.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  image: string;

  @Column({ unique: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;



  @Column({ default: false }) // Thêm trường isDeleted
  isDeleted: boolean;

  @OneToMany(() => FetalRecord, (fetalRecord) => fetalRecord.mother)
  fetalRecords: FetalRecord[]; // Mối quan hệ với bảng FetalRecord

  @OneToMany(() => UserPackages, (userPackages) => userPackages.user)
  userPackages: UserPackages[];  // Mối quan hệ với bảng UserPackages (mua gói)

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[]; // Mối quan hệ với bảng FetalRecord

  @OneToMany(() => Reminder, (reminder) => reminder.mother)
  reminders: Reminder[]; // Mối quan hệ với bảng FetalRecord

  @OneToMany(() => UserPackageServiceUsage, (userPackageServiceUsage) => userPackageServiceUsage.user)
  serviceUsages: UserPackageServiceUsage[]; // Mối quan hệ với bảng FetalRecord


  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];

  @OneToMany(() => AppointmentHistory, (history) => history.changedBy)
  changedAppointmentHistory: AppointmentHistory[];

  @BeforeInsert()
  async initializeUserBeforeInsert() {
    this.generateId(); // Gọi generateId trước khi băm mật khẩu
    this.password = await bcrypt.hash(this.password, 10); // Hash mật khẩu với salt = 10
  }
  generateId() {
    this.id = uuidv4();
  }
}
