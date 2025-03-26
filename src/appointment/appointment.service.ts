import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import { CreateCheckupDto, ServiceUsedDto } from './dto/CreateCheckupDTO';
import { CheckupRecord } from './entities/checkupRecord.entity';
import { AppointmentServiceEntity } from './entities/appointmentService.entity';
import { Services } from 'src/services/services.entity';
import {
  UserPackages,
  UserPackageStatus,
} from 'src/userPackages/entities/userPackages.entity';
import { PackageService } from 'src/packages/entity/packageService.entity';
import { VnpayService } from 'src/common/service/vnpay.service';
import { MailService } from 'src/common/service/mail.service';
import { MedicationBill } from './entities/medicationBill.entity';
import { Medication } from 'src/medication/medication.entity';
import { MedicationBillDetail } from './entities/medicationBillDetail.entity';
import { UserPackageServiceUsage } from 'src/users/model/userPackageServiceUsage.entity';
import { app } from 'firebase-admin';
import { Slot } from 'src/slots/entities/slot.entity';
import { MotherHealthDTO } from './dto/MotherHealthDTO';
import {
  AppointmentHistory,
  AppointmentHistoryStatus,
} from './entities/appointmentHistory.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(FetalRecord)
    private readonly fetalRecordRepo: Repository<FetalRecord>,

    @InjectRepository(User)
    private readonly doctorRepo: Repository<User>,

    @InjectRepository(CheckupRecord)
    private readonly checkupRecordRepo: Repository<CheckupRecord>,

    @InjectRepository(AppointmentServiceEntity)
    private readonly appointmentServiceRepo: Repository<AppointmentServiceEntity>,

    @InjectRepository(Services)
    private readonly serviceRepo: Repository<Services>,

    @InjectRepository(UserPackages)
    private readonly userPackageRepo: Repository<UserPackages>,

    @InjectRepository(PackageService)
    private readonly packageServiceRepo: Repository<PackageService>,

    @InjectRepository(MedicationBill)
    private readonly medicationBillRepo: Repository<MedicationBill>,

    @InjectRepository(Medication)
    private readonly medicationRepo: Repository<Medication>,

    @InjectRepository(MedicationBillDetail)
    private readonly medicationBillDetailRepo: Repository<MedicationBillDetail>,

    @InjectRepository(UserPackageServiceUsage)
    private userPackageServiceUsageRepo: Repository<UserPackageServiceUsage>,

    @InjectRepository(AppointmentHistory)
    private appointmentHistoryRepo: Repository<AppointmentHistory>,

    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    private vnpayService: VnpayService,

    private mailService: MailService,
  ) {}

  async bookAppointment(
    fetalRecords: { fetalRecordId: string }[],
    doctorId: string,
    date: Date,
    slotId: string,
    changedBy?: User,
  ) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const slot = await this.slotRepo.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot not found');

    const now = new Date();
    const requestedDateTime = new Date(date);

    // Extract hours and minutes from the slot's startTime
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    requestedDateTime.setHours(startHour, startMinute, 0, 0);

    if (requestedDateTime < now) {
      throw new BadRequestException('không thể đặt các cuộc hẹn trong quá khứ');
    }

    // Check if the doctor already has an appointment at the given date and slot
    const existingAppointment = await this.appointmentRepo.findOne({
      where: {
        doctor: { id: doctorId },
        appointmentDate: new Date(date), // Compare only the date part for existing appointments
        slot: { id: slotId },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'Bác sĩ này đã có lịch hẹn vào ngày và giờ đã chọn',
      );
    }

    const fetalRecordEntities = await Promise.all(
      fetalRecords.map(async (fetalRecordData) => {
        const fetalRecord = await this.fetalRecordRepo.findOne({
          where: { id: fetalRecordData.fetalRecordId },
        });
        if (!fetalRecord) {
          throw new NotFoundException(
            `Fetal record with ID ${fetalRecordData.fetalRecordId} not found`,
          );
        }
        return fetalRecord;
      }),
    );

    const appointment = this.appointmentRepo.create({
      fetalRecords: fetalRecordEntities,
      doctor,
      appointmentDate: date,
      slot,
      status: AppointmentStatus.PENDING,
    });

    const savedAppointment = await this.appointmentRepo.save(appointment);

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment,
      status: AppointmentStatus.PENDING as any,
      changedBy,
    });
    await this.appointmentHistoryRepo.save(appointmentHistory);

    this.mailService.sendWelcomeEmail(
      doctor.email,
      'Xác Nhận Lịch Khám Ngày ' + date.toLocaleDateString(),
      'Có lịch khám mới vào ngày ' +
        date.toLocaleDateString() +
        '. Vui lòng xác nhận.',
    );

    return savedAppointment;
  }

  //   async updateAppointmentStatus(
  //     appointmentId: string,
  //     status: AppointmentStatus,
  //     checkupData?: CreateCheckupDto, // Dữ liệu khám nếu COMPLETED
  //   ) {
  //     const appointment = await this.appointmentRepo.findOne({
  //       where: { id: appointmentId },
  //       relations: ['fetalRecord', 'doctor'],
  //     });

  //     if (!appointment) throw new NotFoundException('Appointment not found');

  //     // Kiểm tra nếu status không hợp lệ
  //     if (!Object.values(AppointmentStatus).includes(status)) {
  //       throw new BadRequestException('Invalid appointment status');
  //     }

  //     // Nếu là COMPLETED, yêu cầu dữ liệu khám từ bác sĩ
  //     if (status === AppointmentStatus.COMPLETED) {
  //       if (!checkupData) throw new BadRequestException('Checkup data is required for completion');

  //       // Lưu hồ sơ khám
  //       const checkupRecord = this.checkupRecordRepo.create({
  //         fetalRecord: appointment.fetalRecord,
  //         appointment: appointment,
  //         ...checkupData,
  //       });
  //       await this.checkupRecordRepo.save(checkupRecord);

  //       // Nếu có dịch vụ đã sử dụng, lưu vào DB
  //       if (checkupData.servicesUsed && checkupData.servicesUsed.length > 0) {
  //         const appointmentServices = await Promise.all(
  //           checkupData.servicesUsed.map(async (serviceUsed) => {
  //             const service = await this.serviceRepo.findOne({ where: { id: serviceUsed.serviceId } });
  //             if (!service) throw new NotFoundException(`Service with ID ${serviceUsed.serviceId} not found`);

  //             return this.appointmentServiceRepo.create({
  //               appointment,
  //               service,
  //               price: service.price, // Lấy giá từ DB
  //               notes: serviceUsed.notes || '',
  //             });
  //           }),
  //         );

  //         await this.appointmentServiceRepo.save(appointmentServices);
  //       }
  //     }

  //     // Cập nhật trạng thái của appointment
  //     appointment.status = status;
  //     return await this.appointmentRepo.save(appointment);
  //   }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    reason?: string,
    changedBy?: User,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecords', 'doctor', 'fetalRecords.mother'], // Cập nhật relations
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new BadRequestException('Invalid appointment status');
    }
    // const date = appointment.appointmentDate;

    // if (appointment.fetalRecords && appointment.fetalRecords.length > 0) {
    //   const motherEmail = appointment.fetalRecords[0].mother.email;

    //   if (
    //     AppointmentStatus.CONFIRMED.toLocaleLowerCase() ===
    //     status.toLocaleLowerCase()
    //   ) {
    //     this.mailService.sendWelcomeEmail(
    //       motherEmail,
    //       'Lịch Khám Vào Ngày ' + date + ' Đã Được Chấp Nhận',
    //       'Bạn hãy vô xem lịch khám của mình vào ngày ' + date,
    //     );
    //   } else if (
    //     AppointmentStatus.CANCELED.toLocaleLowerCase() ===
    //     status.toLocaleLowerCase()
    //   ) {
    //     this.mailService.sendWelcomeEmail(
    //       motherEmail,
    //       'Lịch Khám Vào Ngày ' + date + ' Đã Bị Từ Chối',
    //       'Bạn hãy vô đặt lại lịch khám khác',
    //     );
    //   }
    // }

    let note; 

    if (
      AppointmentStatus.CANCELED.toLocaleLowerCase() ===
      status.toLocaleLowerCase()
    ) {
      note = reason
      const date = appointment.appointmentDate;

      const motherEmail = appointment.fetalRecords[0].mother.email;
      this.mailService.sendWelcomeEmail(
        motherEmail,
        'Lịch Khám Vào Ngày ' + date + ' Đã Bị Từ Chối',
        `Vì lí do: ${reason}. Nên bạn hãy vô đặt lại lịch khám khác`,
      );
    }

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment,
      status: status as any,
      changedBy,
      notes: note
    });
    await this.appointmentHistoryRepo.save(appointmentHistory);

    appointment.status = status;
    return await this.appointmentRepo.save(appointment);
  }

  async updateMotherHealthForCheckIn(
    appointmentId: string,
    motherHealthDTO: MotherHealthDTO,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecords'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (!appointment.fetalRecords || appointment.fetalRecords.length === 0) {
      throw new NotFoundException(
        'No fetal records found for this appointment',
      );
    }

    for (const fetalRecord of appointment.fetalRecords) {
      const checkupRecord = this.checkupRecordRepo.create({
        appointment,
        fetalRecord,
        motherWeight: motherHealthDTO.motherWeight,
        motherBloodPressure: motherHealthDTO.motherBloodPressure,
        motherHealthStatus: motherHealthDTO.motherHealthStatus,
      });

      await this.checkupRecordRepo.save(checkupRecord);
    }

    return { message: 'Mother health information updated successfully' };
  }

  async startCheckup(
    appointmentId: string,
    servicesUsed: ServiceUsedDto[],
    changedBy?: User,
  ) {
    console.log(appointmentId);

    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecords', 'doctor', 'fetalRecords.mother'], // Cập nhật relations
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Lấy user từ fetalRecords đầu tiên (giả định tất cả fetalRecords liên quan đến cùng một mẹ)
    const user = appointment.fetalRecords[0].mother;

    // 🔹 Lấy danh sách dịch vụ mà user đã mua từ UserPackageServiceUsage
    const userServiceUsages = await this.userPackageServiceUsageRepo.find({
      where: { user, slot: MoreThan(0) },
      relations: ['service'],
    });

    let totalCost = 0;
    const appointmentServices = await Promise.all(
      servicesUsed.map(async (serviceUsed) => {
        const service = await this.serviceRepo.findOne({
          where: { id: serviceUsed.serviceId },
        });
        if (!service)
          throw new NotFoundException(
            `Service ${serviceUsed.serviceId} not found`,
          );

        let price = service.price;
        let isInPackage = false;

        // 🔹 Tìm dịch vụ trong danh sách UserPackageServiceUsage
        const userServiceUsage = userServiceUsages.find(
          (usage) => usage.service.id === service.id && usage.slot > 0,
        );

        if (userServiceUsage) {
          userServiceUsage.slot--; // Trừ lượt sử dụng
          await this.userPackageServiceUsageRepo.save(userServiceUsage);
          price = 0; // Miễn phí nếu còn slot
          isInPackage = true;
        } else {
          totalCost += service.price; // Nếu không có trong gói hoặc hết slot -> tính tiền
        }

        return this.appointmentServiceRepo.create({
          appointment,
          service,
          price,
          isInPackage, // Cập nhật trạng thái có trong gói hay không
          notes: serviceUsed.notes || '',
        });
      }),
    );

    const newAppointmentServices =
      await this.appointmentServiceRepo.save(appointmentServices);

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment,
      status: AppointmentStatus.IN_PROGRESS as any,
      changedBy,
    });
    await this.appointmentHistoryRepo.save(appointmentHistory);

    appointment.status = AppointmentStatus.IN_PROGRESS;
    const newAppointment = await this.appointmentRepo.save(appointment);

    if (totalCost > 0) {
      const param = `?appointmentId=${newAppointment.id}`;
      return await this.vnpayService.createPayment(
        newAppointment.id,
        param,
        totalCost.toString(),
      );
    }

    return {
      appointment,
      totalCost,
      services: newAppointmentServices,
    };
  }

  async completeCheckup(
    appointmentId: string,
    checkupData: CreateCheckupDto,
    medications: { medicationId: string; quantity: number }[],
    changedBy?: User,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecords', 'doctor', 'fetalRecords.checkupRecords'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    if (!checkupData) throw new BadRequestException('Checkup data is required');

    // Lưu kết quả khám cho từng thai nhi
    for (const fetalCheckup of checkupData.fetalCheckups) {
      const fetalRecord = appointment.fetalRecords.find(
        (fr) => fr.id === fetalCheckup.fetalRecordId,
      );
      if (!fetalRecord)
        throw new NotFoundException(
          `Fetal record ${fetalCheckup.fetalRecordId} not found in this appointment`,
        );

      const existingCheckupRecord = await this.checkupRecordRepo.findOne({
        where: { appointment, fetalRecord },
      });

      if (existingCheckupRecord) {
        // Cập nhật thông tin thai nhi
        existingCheckupRecord.fetalWeight =
          fetalCheckup.fetalWeight !== undefined
            ? fetalCheckup.fetalWeight
            : existingCheckupRecord.fetalWeight;
        existingCheckupRecord.fetalHeight =
          fetalCheckup.fetalHeight !== undefined
            ? fetalCheckup.fetalHeight
            : existingCheckupRecord.fetalHeight;
        existingCheckupRecord.fetalHeartbeat =
          fetalCheckup.fetalHeartbeat !== undefined
            ? fetalCheckup.fetalHeartbeat
            : existingCheckupRecord.fetalHeartbeat;
        existingCheckupRecord.warning =
          fetalCheckup.warning !== undefined
            ? fetalCheckup.warning
            : existingCheckupRecord.warning;

        await this.checkupRecordRepo.save(existingCheckupRecord);
      }
    }

    // Tạo hóa đơn thuốc (giữ nguyên)
    let totalPrice = 0;
    const medicationBill = this.medicationBillRepo.create({
      appointment,
      details: [],
    });

    for (const med of medications) {
      const medication = await this.medicationRepo.findOne({
        where: { id: med.medicationId },
      });
      if (!medication)
        throw new NotFoundException(`Medication ${med.medicationId} not found`);

      const total = medication.price * med.quantity;
      totalPrice += total;

      const detail = this.medicationBillDetailRepo.create({
        bill: medicationBill,
        medication,
        quantity: med.quantity,
        price: medication.price,
        total,
      });

      medicationBill.details.push(detail);
    }

    medicationBill.totalPrice = totalPrice;
    await this.medicationBillRepo.save(medicationBill);

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment,
      status: AppointmentStatus.COMPLETED as any,
      changedBy,
    });
    await this.appointmentHistoryRepo.save(appointmentHistory);

    // Cập nhật trạng thái cuộc hẹn
    appointment.status = AppointmentStatus.COMPLETED;
    return await this.appointmentRepo.save(appointment);
  }

  async getAppointmentsByFetalRecord(fetalRecordId: string) {
    const fetalRecord = await this.fetalRecordRepo.findOne({
      where: { id: fetalRecordId },
      relations: [
        'appointments',
        'appointments.doctor',
        'appointments.appointmentServices',
        'appointments.medicationBills',
        'appointments.fetalRecords', // Cập nhật relations
      ],
    });

    if (!fetalRecord) {
      throw new NotFoundException('Fetal record not found');
    }

    return fetalRecord.appointments;
  }

  async getAppointmentWithHistory(appointmentId: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: [
        'fetalRecords', // Cập nhật relations
        'fetalRecords.checkupRecords',
        'doctor',
        'appointmentServices',
        'medicationBills',
        'fetalRecords.mother',
        'history',
        'history.changedBy',
      ],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Kiểm tra nếu không có fetalRecords
    if (!appointment.fetalRecords || appointment.fetalRecords.length === 0) {
      throw new NotFoundException(
        'Fetal records not found for this appointment',
      );
    }

    return appointment;
    // history: appointment.fetalRecords[0].checkupRecords || [], // Lấy checkupRecords từ fetalRecord đầu tiên
  }

  // async getAppointmentsByDoctor(doctorId: string) {
  //   const appointments = await this.appointmentRepo.find({
  //     where: { doctor: { id: doctorId } },
  //     relations: [
  //       'fetalRecords', // Cập nhật relations
  //       'fetalRecords.checkupRecords',
  //       'doctor',
  //       'appointmentServices',
  //       'medicationBills',
  //       'fetalRecords.mother',
  //       'history'
  //     ],
  //   });

  //   if (!appointments.length)
  //     throw new NotFoundException('No appointments found for this doctor');

  //   return appointments
  //     // fullHistory: appointment.fetalRecords[0].checkupRecords, // Lấy checkupRecords từ fetalRecord đầu tiên

  // }

  async getAllAppointmentsByStatus(status: AppointmentStatus) {
    return this.appointmentRepo.find({
      where: { status },
      relations: [
        'fetalRecords', // Cập nhật relations
        'fetalRecords.checkupRecords',
        'doctor',
        'appointmentServices',
        'medicationBills',
        'fetalRecords.mother',
        'history',
      ],
    });
  }

  async getDoctorAppointmentsByDate(
    doctorId: string,
    date: Date,
    status: AppointmentStatus,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: any = {
      doctor: { id: doctorId },
      appointmentDate: Between(startOfDay, endOfDay),
      status,
    };

    const appointments = await this.appointmentRepo.find({
      where: whereClause,
      relations: [
        'fetalRecords',
        'fetalRecords.checkupRecords',
        'doctor',
        'appointmentServices',
        'medicationBills',
        'fetalRecords.mother',
        'slot',
        'history',
      ],
    });

    return appointments;
  }
}
