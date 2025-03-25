import { Category } from 'src/category/category.entity';
import { User } from 'src/users/model/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('text')
  content: string;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  isPublished: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.blogs, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' }) // Chỉ định cột categoryId
  category: Category;

  @Column({ nullable: false }) // Đảm bảo không thể null
  categoryId: string;
  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.blogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
