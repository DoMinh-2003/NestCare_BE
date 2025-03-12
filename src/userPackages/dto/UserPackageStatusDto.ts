import { ApiProperty } from '@nestjs/swagger';
import { UserPackageStatus } from '../entities/userPackages.entity';
import { IsEnum } from 'class-validator';

export class UserPackageStatusDto {
  @ApiProperty({
    enum: UserPackageStatus,
    description: 'Trạng Thái Order',
    example: 'PENDING, PAID, CANCELED',
  })
   @IsEnum(UserPackageStatus)
  status: UserPackageStatus;
}
