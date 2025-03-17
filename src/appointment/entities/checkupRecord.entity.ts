import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Appointment } from "./appointment.entity";
import { FetalRecord } from "src/fetal-records/entities/fetal-record.entity";

@Entity()
export class CheckupRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.checkupRecords, {
    onDelete: 'CASCADE',
  })
  appointment: Appointment;

  @ManyToOne(() => FetalRecord, (fetalRecord) => fetalRecord.checkupRecords, {
    onDelete: 'CASCADE',
  })
  fetalRecord: FetalRecord;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  motherWeight: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherBloodPressure: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherHealthStatus: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fetalWeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fetalHeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fetalHeartbeat: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  warning: string;

  @CreateDateColumn()
  createdAt: Date;
}
