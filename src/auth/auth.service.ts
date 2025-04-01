import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from 'src/common/enums/role.enum';
import * as admin from 'firebase-admin';

import { omit } from 'lodash';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async login(payload: any) {
    const user = await this.usersService.validateUser(
      payload.username,
      payload.password,
    );

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const token = this.jwtService.sign({ id: user.id, role: user.role });

    return { ...omit(user, ['password']), token };
  }
  // async login(payload: any) {
  //   const user = await this.usersService.validateUser(
  //     payload.username,
  //     payload.password,
  //   );

  //   if (!user) {
  //     throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng'); // Ném lỗi 401 nếu sai thông tin
  //   }

  //   const token = this.jwtService.sign({ id: user.id, role: user.role });
  //   return { ...user, token: token };
  // }

  async register(payload: any) {
    const existingUser = await this.usersService.findByUsername(
      payload.username
    );
    if (existingUser) {
      throw new ConflictException('Tên đăng nhập đã tồn tại'); // Nếu đã tồn tại thì ném lỗi
    }

    // Tạo người dùng mới
    const newUser = await this.usersService.createUser(payload);

    return newUser;
  }

  async loginGoogle(firebaseIdToken: string): Promise<any> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
      const email = decodedToken.email;
      const name = decodedToken.name;
      const picture = decodedToken.picture;
      let user;
      if (email) {
        user = await this.usersService.findByEmail(email);
      }


      if (!user) {
        const newUserPayload = {
          username: email,
          email: email,
          fullName: name,
          image: picture,
        };
        user = await this.usersService.createUser(newUserPayload); // Sử dụng lại hàm createUser
      }

      const token = this.jwtService.sign({ id: user.id, role: user.role });
      return { ...user, token: token };
    } catch (error) {
      console.error('Lỗi đăng nhập Google (Firebase):', error);
      throw new UnauthorizedException(
        'Không thể xác thực với Google/Firebase.',
      );
    }
  }
}
