import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicationBill } from "./medicationBill.entity";
import { Medication } from "src/medication/medication.entity";

@Entity()
export class MedicationBillDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicationBill, (bill) => bill.details, { onDelete: 'CASCADE' })
  bill: MedicationBill;

  @ManyToOne(() => Medication, { onDelete: 'CASCADE' })
  medication: Medication;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Giá thuốc tại thời điểm bán

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;
}
