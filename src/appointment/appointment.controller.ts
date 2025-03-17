import { Controller, Post, Get, Param, Body, Put } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from './entities/appointment.entity';
import { CreateCheckupDto, ServiceUsedDto } from './dto/CreateCheckupDTO';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookAppointmentDto } from './dto/BookAppointmentDto';

@ApiTags('Appointments')
@Controller('api/appointments')
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiBody({ type: BookAppointmentDto })
  @Post()
  async bookAppointment(@Body() bookAppointmentDto: BookAppointmentDto) {
    return this.appointmentService.bookAppointment(
      bookAppointmentDto.fetalRecordId,
      bookAppointmentDto.doctorId,
      new Date(bookAppointmentDto.date),
    );
  }

  //   @ApiBody({ type: CreateCheckupDto })
  //   @ApiParam({
  //     name: 'status',
  //     description: 'Trạng thái của Appointments',
  //     enum: AppointmentStatus, // Đây là enum bạn muốn sử dụng
  //   })
  //   @Post(':appointmentId/:status')
  //   async updateAppointmentStatus(
  //     @Param('appointmentId') appointmentId: string,
  //     @Param('status') status: AppointmentStatus,
  //     @Body('checkupData') checkupData?: CreateCheckupDto,
  //   ) {
  //     return this.appointmentService.updateAppointmentStatus(
  //       appointmentId,
  //       status,
  //       checkupData,
  //     );
  //   }

  // 1️⃣ API cập nhật trạng thái (ngoại trừ IN_PROGRESS & COMPLETED)
  @Put(':id/:status')
  @ApiOperation({ summary: 'Cập nhật trạng thái cuộc hẹn' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái của Appointments',
    enum: AppointmentStatus, // Đây là enum bạn muốn sử dụng
  })
  async updateStatus(
    @Param('id') appointmentId: string,
    @Param('status') status: AppointmentStatus,
  ) {
    return this.appointmentService.updateAppointmentStatus(
      appointmentId,
      status,
    );
  }

  // 2️⃣ API Chuyển trạng thái IN_PROGRESS, thêm dịch vụ, check gói
  @Put(':id/in-progress')
  @ApiOperation({ summary: 'Chuyển trạng thái IN_PROGRESS và thêm dịch vụ' })
  @ApiBody({
    type: ServiceUsedDto,
    isArray: true, // ✅ Quan trọng: Định dạng thành mảng
    description: 'Danh sách dịch vụ đã thực hiện',
  })
  async startCheckup(
    @Param('id') appointmentId: string,
    @Body() servicesUsed: ServiceUsedDto[],
  ) {
    return this.appointmentService.startCheckup(appointmentId, servicesUsed);
  }

  // 3️⃣ API Chuyển trạng thái COMPLETED, lưu thông tin khám
  @Put(':id/completed')
  @ApiOperation({
    summary: 'Chuyển trạng thái COMPLETED và lưu thông tin khám',
  })
  @ApiBody({ type: CreateCheckupDto })
  async completeCheckup(
    @Param('id') appointmentId: string,
    @Body() checkupData: CreateCheckupDto,
  ) {
    return this.appointmentService.completeCheckup(
      appointmentId,
      checkupData,
      checkupData.medications,
    );
  }

  @Get(':fetalRecordId/history')
  async getFetalRecordHistory(@Param('fetalRecordId') fetalRecordId: string) {
    return this.appointmentService.getAppointmentsByFetalRecord(fetalRecordId);
  }

  @Get(':appointmentId')
  async getAppointmentWithHistory(
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.appointmentService.getAppointmentWithHistory(appointmentId);
  }

  @Get('by-doctor/:doctorId')
  @ApiParam({
    name: 'doctorId',
    description: 'ID bác sĩ',
    example: 'doctor-123',
  })
  async getAppointmentsByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentService.getAppointmentsByDoctor(doctorId);
  }
}
