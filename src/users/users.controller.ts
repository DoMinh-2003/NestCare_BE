import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
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
@ApiBearerAuth()
@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Roles(Role.Admin)
  async findAll() {
    return this.usersService.findAll();
  }

  @Post('register')
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.usersService.registerUser(registerUserDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get user by ID' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get('role/:role')
  async getUsersByRole(@Param('role') role: Role) {
    return this.usersService.findUsersByRole(role);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Update user details' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/toggle-delete')
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
  async searchUsers(
    @Param('pageNum') pageNum: string,
    @Param('pageSize') pageSize: string,
    @Query('query') query?: string,
  ) {
    console.log(query);
    return this.usersService.searchUsers(Number(pageNum), Number(pageSize), query || '');
  }
}
