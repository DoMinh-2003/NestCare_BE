import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'oldpassword123', description: 'Mật khẩu hiện tại' })
    @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
    currentPassword: string;

    @ApiProperty({ example: 'newpassword456', description: 'Mật khẩu mới' })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    newPassword: string;
}
