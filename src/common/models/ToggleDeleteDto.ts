import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleDeleteDto {
  @ApiProperty({
    description: 'Trạng thái xóa mềm của người dùng (true để xóa, false để khôi phục)',
    type: Boolean,
  })
  @IsBoolean()
  isDeleted: boolean;
}
