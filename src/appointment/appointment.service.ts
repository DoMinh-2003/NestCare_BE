import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { FetalRecord } from 'src/fetal-records/entities/fetal-record.entity';
import { User } from 'src/users/model/user.entity';
import { CreateCheckupDto, ServiceUsedDto } from './dto/CreateCheckupDTO';
import { CheckupRecord } from './entities/checkupRecord.entity';
import { AppointmentServiceEntity } from './entities/appointmentService.entity';
import { Services } from 'src/services/services.entity';
import { UserPackages, UserPackageStatus } from 'src/userPackages/entities/userPackages.entity';
import { PackageService } from 'src/packages/entity/packageService.entity';


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

    
    
  ) {}

  async bookAppointment(fetalRecordId: string, doctorId: string, date: Date) {
    const fetalRecord = await this.fetalRecordRepo.findOne({ where: { id: fetalRecordId } });
    if (!fetalRecord) throw new NotFoundException('Fetal record not found');

    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const appointment = this.appointmentRepo.create({
      fetalRecord,
      doctor,
      appointmentDate: date,
      status: AppointmentStatus.PENDING,
    });

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
    const appointment = await this.appointmentRepo.findOne({ where: { id: appointmentId } });
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
      relations: ['fetalRecord', 'doctor', 'fetalRecord.user'],
    });
  
    if (!appointment) throw new NotFoundException('Appointment not found');
  
    const user = appointment.fetalRecord.mother;
    const userPackage = await this.userPackageRepo.findOne({
      where: { user, status: UserPackageStatus.PAID, isActive: true },
      relations: ['package', 'package.packageServices'],
    });
  
    let totalCost = 0;
    const appointmentServices = await Promise.all(
      servicesUsed.map(async (serviceUsed) => {
        const service = await this.serviceRepo.findOne({ where: { id: serviceUsed.serviceId } });
        if (!service) throw new NotFoundException(`Service ${serviceUsed.serviceId} not found`);
  
        let price = service.price;
        if (userPackage) {
          const packageService = userPackage.package.packageServices.find(ps => ps.service.id === service.id);
          if (packageService && packageService.slot > 0) {
            packageService.slot--; // Trừ lượt sử dụng
            await this.packageServiceRepo.save(packageService);
            price = 0; // Miễn phí nếu có trong gói
          }
        } else {
          totalCost += service.price;
        }
  
        return this.appointmentServiceRepo.create({
          appointment,
          service,
          price,
          notes: serviceUsed.notes || '',
        });
      }),
    );
  
    await this.appointmentServiceRepo.save(appointmentServices);
  
    if (!userPackage && totalCost > 0) {
      return { message: 'Please make a payment', totalCost };
    }
  
    appointment.status = AppointmentStatus.IN_PROGRESS;
    return await this.appointmentRepo.save(appointment);
  }
  


async completeCheckup(appointmentId: string, checkupData: CreateCheckupDto) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecord', 'doctor'],
    });
  
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (!checkupData) throw new BadRequestException('Checkup data is required');
  
    const checkupRecord = this.checkupRecordRepo.create({
      fetalRecord: appointment.fetalRecord,
      appointment,
      ...checkupData,
    });
  
    await this.checkupRecordRepo.save(checkupRecord);
  
    appointment.status = AppointmentStatus.COMPLETED;
    return await this.appointmentRepo.save(appointment);
  }

  

  async getFetalRecordHistory(fetalRecordId: string) {
    const fetalRecord = await this.fetalRecordRepo.findOne({
      where: { id: fetalRecordId },
      relations: ['checkupRecords'],
    });

    if (!fetalRecord) throw new NotFoundException('Fetal record not found');

    return fetalRecord.checkupRecords;
  }

  async getAppointmentWithHistory(appointmentId: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecord', 'fetalRecord.checkupRecords', 'doctor'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    return {
      ...appointment,
      history: appointment.fetalRecord.checkupRecords,
    };
  }
}
