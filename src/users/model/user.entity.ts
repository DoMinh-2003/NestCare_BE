import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Column({ default: false }) // Thêm trường isDeleted
  isDeleted: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // Hash mật khẩu với salt = 10
  }
  generateId() {
    this.id = uuidv4();
  }
}
