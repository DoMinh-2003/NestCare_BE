import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/createReminderDTO';

@ApiTags('Reminders')
@Controller('api/reminders')
@ApiBearerAuth()
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) { }

  @Post()
  @ApiOperation({
    summary: 'Tạo nhắc nhở mới',
    description: 'Bác sĩ tạo lịch nhắc nhở cho mẹ bầu',
  })
  @ApiResponse({ status: 201, description: 'Nhắc nhở đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu nhập vào không hợp lệ.' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createReminderDto: CreateReminderDto) {
    return this.reminderService.createReminder(createReminderDto);
  }

  @Get('mother/:motherId')
  @ApiOperation({
    summary: 'Lấy danh sách nhắc nhở của mẹ bầu',
    description: 'Lấy toàn bộ nhắc nhở của 1 mẹ bầu theo ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhắc nhở trả về thành công.',
  })
  async getRemindersByMotherId(@Param('motherId') motherId: string) {
    return this.reminderService.getRemindersByMotherId(motherId);
  }
}
