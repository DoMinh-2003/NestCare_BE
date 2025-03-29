import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    JoinColumn,
  } from 'typeorm';
  import { User } from 'src/users/model/user.entity';
import { Services } from 'src/services/services.entity';
  
@Entity('user_package_service_usages')
  export class UserPackageServiceUsage {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, (user) => user.serviceUsages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User; // Người mua gói
  
    @ManyToOne(() => Services, (service) => service.packageServices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'service_id' })
    service: Services; // Dịch vụ trong gói
  
    @Column({ type: 'int', default: 0 })
    slot: number; // Số lượt còn lại của dịch vụ trong gói
  }
  