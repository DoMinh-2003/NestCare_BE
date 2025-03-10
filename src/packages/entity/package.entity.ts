import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToMany,
  } from 'typeorm';
import { PackageService } from './packageService.entity';
  
  export enum PeriodType {
    WEEKLY = 'weekly',
    FULL_PREGNANCY = 'full_prenancy',
    TRIMESTER = 'trimester'
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
  
    @Column({
      type: 'enum',
      enum: PeriodType,
    })
    period: PeriodType;
  
    @Column({ type: 'tinyint', width: 1, default: 0 })
    delivery_included: number;
  
    @Column({ type: 'tinyint', width: 1, default: 0 })
    alerts_included: number;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    isDeleted: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => PackageService, (packageService) => packageService.package)
    packageServices: PackageService[];
  }
  