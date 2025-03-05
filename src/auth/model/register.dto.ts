import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class RegisterDTO {

    @ApiProperty({
        description: 'The full name of the user',
        example: 'John Doe',
        type: String,
      })
      @IsNotEmpty()
      fullName: string;
    
      @ApiProperty({
        description: 'The email address of the user',
        example: 'johndoe@example.com',
      })
      @IsNotEmpty()
      @IsEmail()
      email: string;

      @ApiProperty({
        description: 'The username of the user',
        type: String,
      })
      @IsNotEmpty()
      username: string;
    
      @ApiProperty({
        description: 'The password of the user',
        type: String,
      })
      @IsNotEmpty()
      @MinLength(6, { message: 'Password must be at least 6 characters long' })
      password: string;
    
      @ApiProperty({
        description: 'The phone number of the user',
        example: '+1 123-456-7890',
      })
      @IsNotEmpty()
      @IsPhoneNumber()
      phone: string;
    
    
}