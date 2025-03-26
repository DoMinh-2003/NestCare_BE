import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSlotDto {
  @ApiProperty({ example: '07:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '19:00' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: 30 })
  @IsNotEmpty()
  @IsNumber()
  duration: number;
}