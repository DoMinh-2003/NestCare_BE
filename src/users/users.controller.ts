import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { User } from './model/user.entity';
import { ToggleDeleteDto } from '../common/models/ToggleDeleteDto';
import { UpdateUserDTO } from './dto/UpdateUserDTO';
import { SearchWithPaginationDto } from './dto/searchWithPagination.dto';
import { Public } from 'src/auth/decorators/public.decorator';
@ApiBearerAuth()
@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  // @Roles(Role.Admin)
  async findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Post('register')
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.usersService.registerUser(registerUserDto);
  }



  @Get('role/:role')
  @Public()
  async getUsersByRole(@Param('role') role: Role) {
    return this.usersService.findUsersByRole(role);
  }

  @Put()
  @ApiResponse({ status: 200, description: 'Update user details' })
  async update(
    @Request() req: Request,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    const userId = (req as any).user.id
    return this.usersService.update(userId, updateUserDto);
  }

  @Put('toggle-delete/:id')
  @ApiBody({
    description: 'Toggle isDeleted status for the service',
    type: ToggleDeleteDto,
  })
  @ApiResponse({ status: 200, description: 'User status toggled successfully' })
  async toggleDeleteStatus(
    @Param('id') id: string,
    @Body() toggleDeleteDto: ToggleDeleteDto,
  ): Promise<void> {
    return this.usersService.toggleDeleteStatus(id, toggleDeleteDto.isDeleted);
  }

  @Get('search/:pageNum/:pageSize')
  @ApiParam({ name: 'pageNum', description: 'Số trang', example: 1 })
  @ApiParam({ name: 'pageSize', description: 'Số lượng bản ghi trên mỗi trang', example: 10 })
  @ApiQuery({ name: 'query', description: 'Từ khóa tìm kiếm (tùy chọn)', required: false, example: 'name or phone or email' })
  @ApiQuery({ name: 'role', description: 'Vai trò người dùng (tùy chọn)', required: false, example: 'doctor' })
  async searchUsers(
    @Param('pageNum') pageNum: string,
    @Param('pageSize') pageSize: string,
    @Query('query') query?: string,
    @Query('role') role?: Role, // Thêm role vào Query
  ) {
    return this.usersService.searchUsers(Number(pageNum), Number(pageSize), query, role);
  }


  @Get('available-services/:userId')
  async getAvailableServices(@Param('userId') userId: string) {
    return this.usersService.getAvailableServices(userId);
  }

  @Get('available-doctor')
  @ApiOperation({
    summary: 'Lấy tất cả bác sĩ rảnh vào một ngày và khung giờ cụ thể',
  })
  @ApiQuery({
    name: 'date',
    description: 'Ngày cần kiểm tra (YYYY-MM-DD)',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'slotId',
    description: 'ID của khung giờ cần kiểm tra',
    type: 'string',
    required: true,
  })
  @Public()
  async getAvailableDoctors(
    @Query('date') dateString: string,
    @Query('slotId') slotId: string,
  ) {
    // You might want to add a check here to ensure only authorized users can access this

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD.');
    }

    return this.usersService.getAvailableDoctors(date, slotId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get user by ID' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}
