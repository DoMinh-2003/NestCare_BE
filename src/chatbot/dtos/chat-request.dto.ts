import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatRequestDto {
    @ApiProperty({
        example: 'Tôi muốn biết về các gói dịch vụ cho mẹ bầu.',
        description: 'Nội dung tin nhắn mà người dùng gửi đến chatbot.',
      })
  @IsNotEmpty()
  @IsString()
  message: string;
}