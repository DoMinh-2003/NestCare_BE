import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateWeekCheckupDto } from './dto/CreateWeekCheckupDto';
import { UpdateWeekCheckupDto } from './dto/UpdateWeekCheckupDto';
import { WeekCheckupService } from './weekCheckup.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiBearerAuth()
@ApiTags('Week Checkup') // Hiển thị nhóm API trong Swagger
@Controller('api/week-checkup')
export class WeekCheckupController {
  constructor(private readonly weekCheckupService: WeekCheckupService) {}

  @ApiOperation({ summary: 'Tạo một lịch khám theo tuần' })
  @ApiBody({
      type: CreateWeekCheckupDto,
    })
  @Post()
  async create(@Body() dto: CreateWeekCheckupDto) {
    return this.weekCheckupService.create(dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách tất cả lịch khám' })
  @Get()
  async findAll() {
    return this.weekCheckupService.findAll();
  }

  @ApiOperation({ summary: 'Cập nhật lịch khám theo tuần' })
  @ApiBody({
    type: UpdateWeekCheckupDto,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWeekCheckupDto) {
    return this.weekCheckupService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa lịch khám theo tuần' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.weekCheckupService.delete(id);
  }


   @Cron('0 7 * * *') // Chạy lúc 07:00 sáng mỗi ngày
// @Cron('* * * * *')
  async handleCron() {
    console.log("hihi");
    await this.weekCheckupService.sendWeeklyCheckupReminders();
  }
}
