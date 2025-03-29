import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/createReminderDTO';
import { console } from 'inspector';

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
  async createReminder(@Body() dto: CreateReminderDto, @Req() req: Request) {
    const doctorId = (req as any).user.id;
    return this.reminderService.createReminder(dto, doctorId);
  }

  @Get('mother')
  @ApiOperation({
    summary: 'Lấy danh sách nhắc nhở của mẹ bầu',
    description: 'Lấy toàn bộ nhắc nhở của 1 mẹ bầu theo ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhắc nhở trả về thành công.',
  })
  async getRemindersByMotherId(@Req() req: Request) {
    const motherId = (req as any).user.id;
    return this.reminderService.getRemindersByMotherId(motherId);
  }

  @Get('/by-doctor/:motherId')
  @ApiParam({
    name: 'motherId',
    description: 'Trạng thái của Appointments',
  })
  async getMyReminders(@Req() req: Request, @Param('motherId') motherId: string) {
    const doctorId = (req as any).user.id;
    console.log(motherId)
    return this.reminderService.getRemindersCreatedByDoctor(doctorId, motherId);
  }

}
