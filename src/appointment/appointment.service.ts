import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    private vnpayService: VnpayService,

    private mailService: MailService,
  ) {}

  async bookAppointment(fetalRecordId: string, doctorId: string, date: Date) {
    const fetalRecord = await this.fetalRecordRepo.findOne({
      where: { id: fetalRecordId },
    });
    if (!fetalRecord) throw new NotFoundException('Fetal record not found');

    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const appointment = this.appointmentRepo.create({
      fetalRecord,
      doctor,
      appointmentDate: date,
      status: AppointmentStatus.PENDING,
    });

    this.mailService.sendWelcomeEmail(
      doctor.email,
      'Xác Nhận Lịch Khác Ngày ' + date,
      'Bạn hãy vô xác nhận lịch khám của mẹ bầu vào ngày ' + date,
    );

    return await this.appointmentRepo.save(appointment);
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
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new BadRequestException('Invalid appointment status');
    }

    appointment.status = status;
    return await this.appointmentRepo.save(appointment);
  }


  async startCheckup(appointmentId: string, servicesUsed: ServiceUsedDto[]) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecord', 'doctor', 'fetalRecord.mother'],
    });
  
    if (!appointment) throw new NotFoundException('Appointment not found');
  
    const user = appointment.fetalRecord.mother;
  
    // Lấy tất cả các gói của user (PAID và đang active)
    const userPackages = await this.userPackageRepo.find({
      where: { user, status: UserPackageStatus.PAID, isActive: true },
      relations: ['package', 'package.packageServices'],
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
  
        // Duyệt qua tất cả các gói xem có gói nào chứa dịch vụ này không
        for (const userPackage of userPackages) {
          const packageService = userPackage.package.packageServices.find(
            (ps) => ps.service.id === service.id,
          );
  
          if (packageService && packageService.slot > 0) {
            packageService.slot--; // Trừ lượt sử dụng
            await this.packageServiceRepo.save(packageService);
            price = 0; // Miễn phí nếu còn slot
            isInPackage = true;
            break; // Dừng lại ngay khi tìm thấy gói có slot còn lại
          }
        }
  
        // Nếu không có trong gói nào hoặc hết slot -> tính tiền
        if (!isInPackage) {
          totalCost += service.price;
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
  
    await this.appointmentServiceRepo.save(appointmentServices);
    appointment.status = AppointmentStatus.IN_PROGRESS;
  
    const newAppointment = await this.appointmentRepo.save(appointment);
  
    if (totalCost > 0) {
      const param = `?appointmentId=${newAppointment.id}`;
      return await this.vnpayService.createPayment(
        newAppointment.id,
        param,
        totalCost,
      );
    }
  
    return newAppointment;
  }
  

  async completeCheckup(
    appointmentId: string,
    checkupData: CreateCheckupDto,
    medications: { medicationId: string; quantity: number }[],
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecord', 'doctor'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    if (!checkupData) throw new BadRequestException('Checkup data is required');

    // Lưu kết quả khám
    const checkupRecord = this.checkupRecordRepo.create({
      fetalRecord: appointment.fetalRecord,
      appointment,
      ...checkupData,
    });
    await this.checkupRecordRepo.save(checkupRecord);

    // Tạo hóa đơn thuốc
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
        'fetalRecord',
        'fetalRecord.checkupRecords',
        'doctor',
        'appointmentServices',
        'medicationBills',
        'fetalRecord.mother'
      ],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Kiểm tra nếu không có fetalRecord
    if (!appointment.fetalRecord) {
      throw new NotFoundException(
        'Fetal record not found for this appointment',
      );
    }

    return {
      ...appointment,
      history: appointment.fetalRecord.checkupRecords || [], // Nếu không có checkupRecords, trả về mảng rỗng
    };
  }


  async getAppointmentsByDoctor(doctorId: string) {
    const appointments = await this.appointmentRepo.find({
      where: { doctor: { id: doctorId } }, // Lọc theo bác sĩ
      relations: [
        'fetalRecord',
        'fetalRecord.checkupRecords', // Lấy toàn bộ lịch sử khám của thai kỳ
        'doctor',
        'appointmentServices',
        'medicationBills',
        'fetalRecord.mother'
      ],
    });
  
    if (!appointments.length) throw new NotFoundException('No appointments found for this doctor');
  
    return appointments.map(appointment => ({
      ...appointment,
      fullHistory: appointment.fetalRecord.checkupRecords, // Trả về toàn bộ lịch sử khám của thai kỳ
    }));
  }
  
}