import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PurchasePackageDto {
  @ApiProperty({
    description: 'ID của người dùng',
    type: String,
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID của gói dịch vụ',
    type: String,
  })
  @IsUUID()
  packageId: string;
}
