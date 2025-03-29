import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  import { Services } from 'src/services/services.entity';
  
  @Entity('week_checkup_services')
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
    @JoinTable({
      name: 'week_checkup_service_mappings', // Đặt tên bảng trung gian
      joinColumn: { name: 'week_checkup_service_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
    })
    services: Services[]; // Các dịch vụ cần thực hiện trong tuần đó
  }
  