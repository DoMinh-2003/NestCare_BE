import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  
    if (user && (await bcrypt.compare(password, user.password))) {
      return user; // Nếu mật khẩu đúng, trả về user
    }
  
    return null; // Nếu sai, trả về null
  }

  // Tìm người dùng theo username (sử dụng findOne)
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByID(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // Tạo người dùng mới
  async createUser(payload: any): Promise<User> {
    // Tạo người dùng mới từ payload

    const newUser = this.userRepository.create({
      ...payload, 
      role: Role.User,  // Nếu không có role, mặc định là User
    });
    const savedUser = this.userRepository.save(newUser); 
    return savedUser instanceof Array ? savedUser[0] : savedUser;
  }
}
