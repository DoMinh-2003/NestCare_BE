import { Controller, Post, Get, Param, Body, Put, Query, Request, BadRequestException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from './entities/appointment.entity';
import { CreateCheckupDto, ServiceUsedDto } from './dto/CreateCheckupDTO';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookAppointmentDto } from './dto/BookAppointmentDto';
import { MotherHealthDTO } from './dto/MotherHealthDTO';

@ApiTags('Appointments')
@Controller('api/appointments')
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiBody({ type: BookAppointmentDto })
  @Post()
  async bookAppointment(@Body() bookAppointmentDto: BookAppointmentDto,
  @Request() req: any
) {
  const changedBy = req.user
    return this.appointmentService.bookAppointment(
      bookAppointmentDto.fetalRecordIds,
      bookAppointmentDto.doctorId,
      new Date(bookAppointmentDto.date),
      bookAppointmentDto.slotId,
      changedBy
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

  @Put('mother-health/:appointmentId')
  @ApiOperation({ summary: 'Y tá cập nhật thông tin sức khỏe của mẹ khi Check-in' })
  @ApiBody({
    type: MotherHealthDTO,
    description: 'sau khi check in khám sức khoẻ ng mẹ',
  })
  async updateMotherHealth(
    @Param('appointmentId') appointmentId: string,
    @Body() motherHealthDTO: MotherHealthDTO,
  ) {
    return this.appointmentService.updateMotherHealthForCheckIn(
      appointmentId,
      motherHealthDTO,
    );
  }

  // 2️⃣ API Chuyển trạng thái IN_PROGRESS, thêm dịch vụ, check gói
  @Put('in-progress/:id')
  @ApiOperation({ summary: 'Chuyển trạng thái IN_PROGRESS và thêm dịch vụ' })
  @ApiBody({
    type: ServiceUsedDto,
    isArray: true, // ✅ Quan trọng: Định dạng thành mảng
    description: 'Danh sách dịch vụ đã thực hiện',
  })
  async startCheckup(
    @Param('id') id: string,
    @Body() servicesUsed: ServiceUsedDto[],
    @Request() req: any
  ) {
    console.log(id);
    const changedBy = req.user

    return this.appointmentService.startCheckup(id, servicesUsed, changedBy);
  }

  // 3️⃣ API Chuyển trạng thái COMPLETED, lưu thông tin khám
  @Put('completed/:id')
  @ApiOperation({
    summary: 'Chuyển trạng thái COMPLETED và lưu thông tin khám',
  })
  @ApiBody({ type: CreateCheckupDto })
  async completeCheckup(
    @Param('id') appointmentId: string,
    @Body() checkupData: CreateCheckupDto,
    @Request() req: any
  ) {
    const changedBy = req.user
    


    return this.appointmentService.completeCheckup(
      appointmentId,
      checkupData,
      checkupData.medications,
      changedBy
    );
  }

  // 1️⃣ API cập nhật trạng thái (ngoại trừ IN_PROGRESS & COMPLETED)
  @Put(':id/:status')
  @ApiOperation({ summary: 'Cập nhật trạng thái cuộc hẹn' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái của Appointments',
    enum: AppointmentStatus, // Đây là enum bạn muốn sử dụng
  })
 @ApiQuery({
     name: 'reason',
     description: 'lý do cancel lịch khám',
     type: 'string',
     required: false,
   })
  async updateStatus(
    @Request() req: any,
    @Param('id') appointmentId: string,
    @Param('status') status: AppointmentStatus,
    @Query('reason') reason?: string,
  ) {
    const changedBy = req.user
    return this.appointmentService.updateAppointmentStatus(
      appointmentId,
      status,
      reason,
      changedBy
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

  // @Get('by-doctor/:doctorId')
 
  // async getAppointmentsByDoctor(@Param('doctorId') doctorId: string) {
  //   return this.appointmentService.getAppointmentsByDoctor(doctorId);
  // }

  @Get('by-status/:status')
  @ApiParam({
    name: 'status',
    description: 'Trạng thái của Appointments',
    enum: AppointmentStatus, // Đây là enum bạn muốn sử dụng
  })
  async getByStatus(@Param('status') status: AppointmentStatus) {
    return this.appointmentService.getAllAppointmentsByStatus(status);
  }


  @Get('doctor-date/:doctorId/:date/:status')
  @ApiOperation({
    summary: 'Lấy tất cả cuộc hẹn của bác sĩ theo ngày và trạng thái (tùy chọn)',
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID bác sĩ',
    example: 'doctor-123',
  })
  @ApiParam({
    name: 'date',
    description: 'Ngày của cuộc hẹn (YYYY-MM-DD)',
    type: 'string',
  })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái của Appointments',
    enum: AppointmentStatus, // Đây là enum bạn muốn sử dụng
  })
  async getDoctorAppointmentsByDate(
    @Param('doctorId') doctorId: string,
    @Param('date') dateString: string,
    @Param('status') status: AppointmentStatus, // Cho phép null hoặc undefined
  ) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD.');
    }

    return this.appointmentService.getDoctorAppointmentsByDate(
      doctorId,
      date,
      status,
    );
  }



}
