import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';


export class UpdateSlotDto {
    @ApiProperty({ required: false, example: '08:00' })
    @IsOptional()
    @IsString()
    startTime?: string;
  
    @ApiProperty({ required: false, example: '18:30' })
    @IsOptional()
    @IsString()
    endTime?: string;
  
    @ApiProperty({ required: false, example: 60 })
    @IsOptional()
    @IsNumber()
    duration?: number;
}