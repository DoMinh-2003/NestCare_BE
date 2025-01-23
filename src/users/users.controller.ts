import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags("Users")
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @ApiBearerAuth()
  @Get()
  @Roles(Role.Admin)
  async findAll() {
    return this.usersService.findAll();
  }
}
