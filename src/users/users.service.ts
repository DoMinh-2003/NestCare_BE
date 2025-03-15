import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { UpdateUserDTO } from './dto/UpdateUserDTO';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }


  // Hàm đăng ký người dùng
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password, fullName, phone, role, image } = registerUserDto;
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    user.fullName = fullName;
    user.phone = phone;
    user.role = role;
    user.image = image;

    // Tạo ID và mã hóa mật khẩu
    await user.initializeUserBeforeInsert();

    return this.userRepository.save(user);
  }

  async findUsersByRole(role: Role): Promise<User[]> {
    return this.userRepository.find({ where: { role, isDeleted: false } });
  }


  // Hàm tìm người dùng theo ID

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({where: {id: id}});
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Hàm cập nhật người dùng
  async update(id: string, updateUserDto: UpdateUserDTO): Promise<User> {
    const user = await this.findOne(id);
    console.log(user);
    if (user) {
      Object.assign(user, updateUserDto);
      return this.userRepository.save(user);
    }
    throw new Error('User not found');
  }

 // Hàm toggle trạng thái isDeleted
 async toggleDeleteStatus(id: string, isDeleted: boolean): Promise<void> {
  const user = await this.userRepository.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  user.isDeleted = isDeleted; // Cập nhật trạng thái isDeleted
  await this.userRepository.save(user); // Lưu thay đổi vào cơ sở dữ liệu
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

  // async findByID(id: string): Promise<User | null> {
  //   return this.userRepository.findOne({ where: { id } });
  // }

  // Tạo người dùng mới
  async createUser(payload: any): Promise<User> {
    // Tạo người dùng mới từ payload

    const newUser = this.userRepository.create({
      ...payload,
      role: Role.User, // Nếu không có role, mặc định là User
    });
    const savedUser = this.userRepository.save(newUser);
    return savedUser instanceof Array ? savedUser[0] : savedUser;
  }
}
