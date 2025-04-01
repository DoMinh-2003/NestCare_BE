import { IsNotEmpty, IsString } from 'class-validator';

export class ChatResponseDto {
  @IsNotEmpty()
  @IsString()
  reply: string;
}