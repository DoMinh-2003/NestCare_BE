import { User } from 'src/users/model/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.blogs)
  author: User;

  @Column({ nullable: true })
  authorId: string;

  @Column()
  description: string;

  @Column('text')
  content: string;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  isPublished: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
