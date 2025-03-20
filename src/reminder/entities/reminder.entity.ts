import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/model/user.entity';

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reminders)
  mother: User; // Mẹ bầu nhận nhắc nhở

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'time' }) // Chỉ lưu giờ và phút
  reminderTime: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isSent: boolean; // Kiểm soát gửi thông báo

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
