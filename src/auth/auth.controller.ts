import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './model/login.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { RegisterDTO } from './model/register.dto';
import { sigupDTO } from './model/sign-up.dto';
import { LoginGGDTO } from './model/loginGG.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiBody({ type: LoginDTO }) // Định nghĩa DTO cho body
  async login(@Body() loginDTO: LoginDTO) {
    console.log(loginDTO);
    return this.authService.login(loginDTO);
  }

  @Post('register')
  @Public()
  @ApiBody({ type: sigupDTO }) // Định nghĩa DTO cho body
  async register(@Body() signup: sigupDTO) {
    return this.authService.register(signup);
  }

  @Public()
  @Post('/login-google')
  @ApiBody({ type: LoginGGDTO }) // Định nghĩa DTO cho body
  async loginGoogle(@Body() loginGGDTO: LoginGGDTO): Promise<any> {
    return this.authService.loginGoogle(loginGGDTO.token);
  }
}
