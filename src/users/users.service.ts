import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './model/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { UpdateUserDTO } from './dto/UpdateUserDTO';
import { SearchWithPaginationDto } from './dto/searchWithPagination.dto';
import { UserPackageServiceUsage } from './model/userPackageServiceUsage.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,


       @InjectRepository(UserPackageServiceUsage)
        private userPackageServiceUsageRepository: Repository<UserPackageServiceUsage>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }


  // Hàm đăng ký người dùng
  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password, fullName, phone, role, image } = registerUserDto;
    // const user = new User();
    // user.username = username;
    // user.email = email;
    // user.password = password;
    // user.fullName = fullName;
    // user.phone = phone;
    // user.role = role;
    // user.image = image;

    const newUser = this.userRepository.create({
      username : username,
     email : email,
      password : password,
      fullName : fullName,
      phone : phone,
      role : role,
      image : image
    });
    const savedUser = this.userRepository.save(newUser);
    return savedUser instanceof Array ? savedUser[0] : savedUser;
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


  async searchUsers(pageNum: number, pageSize: number, query?: string, role?: Role) {
    const qb = this.userRepository.createQueryBuilder('user')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });
  
    // Nếu có role thì lọc theo role
    if (role) {
      qb.andWhere('user.role = :role', { role });
    }
  
    // Nếu có query thì tìm theo tên, email, hoặc số điện thoại
    if (query && query.trim() !== '') {
      qb.andWhere(
        `(LOWER(user.fullName) LIKE LOWER(:queryFullName) 
        OR LOWER(user.email) LIKE LOWER(:queryEmail) 
        OR user.phone LIKE :queryPhone)`,
        {
          queryFullName: `%${query}%`,
          queryEmail: `%${query}%`,
          queryPhone: `%${query}%`,
        }
      );
    }
  
    qb.skip((pageNum - 1) * pageSize).take(pageSize);
  
    const [users, total] = await qb.getManyAndCount();
  
    return {
      users,
      total,
      pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
  


  async getAvailableServices(userId: string) {
    const services = await this.userPackageServiceUsageRepository.find({
      where: { user: { id: userId }, slot: MoreThan(0) },
      relations: ['service'],
    });

    if (!services.length) {
      throw new NotFoundException('No available services found for this user');
    }

    return services;
  }
  
  
  
}
