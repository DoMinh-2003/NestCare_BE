import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  import { Services } from 'src/services/services.entity';
  
  @Entity()
  export class WeekCheckupServiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'int', unique: true })
    week: number; // Số tuần thai nhi cần khám
  
    @Column()
    title: string; // Tiêu đề thông báo
  
    @Column('text')
    description: string; // Mô tả chi tiết
  
    @ManyToMany(() => Services)
    @JoinTable()
    services: Services[]; // Các dịch vụ cần thực hiện trong tuần đó
  }
  