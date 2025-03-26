import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class sigupDTO {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()

  email: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe123',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1 123-456-7890',
  })
  @IsNotEmpty()
  phone: string;
}
