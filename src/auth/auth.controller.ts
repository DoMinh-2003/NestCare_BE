import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './model/login.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { RegisterDTO } from './model/register.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiBody({ type: LoginDTO }) // Định nghĩa DTO cho body
  async login(@Body() loginDTO: LoginDTO) {2
    return this.authService.login(loginDTO);
  }

  @Post('register')
  @Public()
  @ApiBody({ type: RegisterDTO }) // Định nghĩa DTO cho body
  async register(@Body() registerDTO: RegisterDTO) {
    return this.authService.register(registerDTO);
  }



}
