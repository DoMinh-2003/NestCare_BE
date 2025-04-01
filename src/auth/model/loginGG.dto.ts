import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginGGDTO {
  @ApiProperty({
    description: 'Token Firebase',
    type: String,
  })
  @IsNotEmpty()
  token: string;
}