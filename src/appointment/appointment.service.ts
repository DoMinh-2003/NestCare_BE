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
import {
  TransactionStatus,
  TransactionType,
} from 'src/transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { ServiceBilling } from './entities/service-billing.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Role } from 'src/common/enums/role.enum';

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
    private readonly userPackagesRepo: Repository<UserPackages>,

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

    @InjectRepository(ServiceBilling)
    private serviceBillingRepo: Repository<ServiceBilling>,

    private vnpayService: VnpayService,

    private mailService: MailService,

    private transactionService: TransactionService,

     private schedulerRegistry: SchedulerRegistry,
  ) {}

  private async scheduleNoShowCheck(appointment: Appointment,fetalRecord: FetalRecord, doctor: User) {
    this.mailService.sendWelcomeEmail(

      fetalRecord.mother.email,
      
      'Xác Nhận Lịch Khám Bệnh Viện',
      
      `Chào bạn ${fetalRecord.mother.fullName},
      
      
      
      Lịch khám của bạn đã được đặt thành công vào ngày ${appointment.appointmentDate} lúc ${appointment.slot.startTime} với bác sĩ ${doctor.fullName}.
      
      
      
      **Lưu ý quan trọng:**
      
      - Vui lòng đến sớm trước giờ hẹn 15 phút để làm thủ tục check-in.
      
      - Nếu bạn đến muộn quá 15 phút so với giờ hẹn, lịch khám có thể bị hủy.
      
      
      
      Vui lòng liên hệ với chúng tôi nếu bạn có bất kỳ thay đổi nào.
      
      
      
      Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.`,
      
      );
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    const [startHourSchedule, startMinuteSchedule] = appointment.slot.startTime
      .split(':')
      .map(Number);
    appointmentTime.setHours(startHourSchedule, startMinuteSchedule, 0, 0);

    const fifteenMinutesAfter = new Date(appointmentTime);
    fifteenMinutesAfter.setMinutes(fifteenMinutesAfter.getMinutes() + 15);

    const jobName = `noShowCheck-${appointment.id}`;

    this.schedulerRegistry.addTimeout(
      jobName,
      setTimeout(async () => {
        const appointmentToCheck = await this.appointmentRepo.findOne({
          where: { id: appointment.id },
          relations: ['fetalRecords', 'fetalRecords.mother', 'doctor'], // Load relations for email
        });
        if (
          appointmentToCheck &&
          appointmentToCheck.status === AppointmentStatus.PENDING 
        ) {
          appointmentToCheck.status = AppointmentStatus.NO_SHOW;
          await this.appointmentRepo.save(appointmentToCheck);

          const appointmentHistoryEntry = this.appointmentHistoryRepo.create({
            appointment: appointmentToCheck,
            status: AppointmentHistoryStatus.NO_SHOW,
            notes:
              'Hệ thống tự động chuyển trạng thái thành Không đến do quá 15 phút sau giờ hẹn mà chưa check-in.',
          });
          await this.appointmentHistoryRepo.save(appointmentHistoryEntry);

          console.log(`Appointment ${appointment.id} marked as NO_SHOW.`);
            // Gửi email thông báo hủy lịch do không đến
            if (appointmentToCheck.fetalRecords && appointmentToCheck.fetalRecords.length > 0 && appointmentToCheck.fetalRecords[0].mother) {
              this.mailService.sendWelcomeEmail(
                appointmentToCheck.fetalRecords[0].mother.email,
                'Thông Báo Hủy Lịch Khám Bệnh Viện',
                `Chào bạn ${appointmentToCheck.fetalRecords[0].mother.fullName},
  
  Chúng tôi rất tiếc phải thông báo rằng lịch khám của bạn vào ngày ${appointmentToCheck.appointmentDate} lúc ${appointmentToCheck.slot.startTime} với bác sĩ ${appointmentToCheck.doctor.fullName} đã bị hủy do bạn không đến trong vòng 15 phút sau giờ hẹn.
  
  Nếu bạn vẫn có nhu cầu khám, vui lòng đặt lịch hẹn mới.
  
  Cảm ơn bạn.`,
              );
            }
        }
        this.schedulerRegistry.deleteTimeout(jobName); // Xóa timeout sau khi chạy
      }, fifteenMinutesAfter.getTime() - now.getTime()), // Tính toán độ trễ
    );
  }

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

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

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
        appointmentDate: Between(startOfDay, endOfDay), // Compare only the date part for existing appointments
        slot: { id: slotId },
        status: AppointmentStatus.PENDING,
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
          relations: ['mother'],
        });
        if (!fetalRecord) {
          throw new NotFoundException(
            `Fetal record with ID ${fetalRecordData.fetalRecordId} not found`,
          );
        }

        // Check if this fetal record already has an appointment at the given date and slot
        const existingFetalAppointment = await this.appointmentRepo.findOne({
          where: {
            fetalRecords: { id: fetalRecord.id },
            appointmentDate: Between(startOfDay, endOfDay),
            slot: { id: slotId },
            status: AppointmentStatus.PENDING,
          },
        });

        if (existingFetalAppointment) {
          throw new BadRequestException(
            `Thai nhi ${fetalRecord.name} đã có lịch hẹn vào ngày và giờ này.`,
          );
        }

        return fetalRecord;
      }),
    );

    const fetalRecord = fetalRecordEntities[0];

    // Check for active packages for the mother
    const activePackages = await this.userPackagesRepo.find({
      where: { user: { id: fetalRecord.mother.id }, isActive: true },
    });

    let appointmentStatus = AppointmentStatus.PENDING;
    let paymentUrl: string | null = null;

    if (!activePackages || activePackages.length === 0) {
      // Mother has no active packages, set status to AWAITING_DEPOSIT and generate VNPAY URL
      appointmentStatus = AppointmentStatus.AWAITING_DEPOSIT;
    }

    const appointment = this.appointmentRepo.create({
      fetalRecords: fetalRecordEntities,
      doctor,
      appointmentDate: date,
      slot,
      status: appointmentStatus, // Set the determined status
    });

    const savedAppointment = await this.appointmentRepo.save(appointment);

    if (appointmentStatus === AppointmentStatus.AWAITING_DEPOSIT) {
      const depositAmount = 50000;
      const bookingId = savedAppointment.id;
      const returnUrlParams = `?bookingId=${bookingId}`;

      paymentUrl = await this.vnpayService.createPayment(
        bookingId,
        returnUrlParams,
        depositAmount * 100,
      );
    }

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment: savedAppointment,
      status: appointmentStatus as any,
      changedBy,
    });
    await this.appointmentHistoryRepo.save(appointmentHistory);

    if (appointmentStatus === AppointmentStatus.PENDING) {
      // Lên lịch kiểm tra và chuyển trạng thái NO_SHOW bằng hàm riêng
      this.scheduleNoShowCheck(savedAppointment, fetalRecord, doctor);
    }

    return paymentUrl ? paymentUrl : savedAppointment;
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
      relations: [
        'fetalRecords',
        'doctor',
        'fetalRecords.mother',
        'serviceBilling',
        'slot',
        'serviceBilling.appointmentServices',
        'serviceBilling.appointmentServices.service',
      ], // Eager load serviceBilling và các dịch vụ
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

      if (changedBy && changedBy.role === Role.User) {
        const appointmentDateTime = new Date(appointment.appointmentDate);
        const [startHour, startMinute] = appointment.slot.startTime.split(':').map(Number);
        appointmentDateTime.setHours(startHour, startMinute, 0, 0);

        const now = new Date();
        const timeDifferenceInMilliseconds = appointmentDateTime.getTime() - now.getTime();
        const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);

        if (timeDifferenceInHours < 24) {
          throw new BadRequestException(
            'Bạn chỉ có thể hủy lịch hẹn trước 24 giờ so với thời gian đã đặt.',
          );
        }
        }
      note = reason;
      const date = appointment.appointmentDate;

      const motherEmail = appointment.fetalRecords[0].mother.email;
      this.mailService.sendWelcomeEmail(
        motherEmail,
        'Lịch Khám Vào Ngày ' + date + ' Đã Bị Từ Chối',
        `Vì lí do: ${reason}. Nên bạn hãy vô đặt lại lịch khám khác`,
      );
    } else if (
      AppointmentStatus.PENDING.toLocaleLowerCase() ===
      status.toLocaleLowerCase()
    ) {
      await this.transactionService.create({
        userId: appointment.fetalRecords[0].mother.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.SUCCESS,
        amount: 50000,
        description: `Thanh toán cọc thành công cho lịch hẹn ${appointmentId}`,
        appointmentId: appointment.id,
      });
      this.scheduleNoShowCheck(appointment, appointment.fetalRecords[0], appointment.doctor);

    } else if (
      AppointmentStatus.IN_PROGRESS.toLocaleLowerCase() ===
      status.toLocaleLowerCase()
    ) {
      // const appointmentHistory = this.appointmentHistoryRepo.create({
      //   appointment,
      //   status: AppointmentStatus.IN_PROGRESS as any,
      //   changedBy,
      // });
      // await this.appointmentHistoryRepo.save(appointmentHistory);

      appointment.status = AppointmentStatus.IN_PROGRESS;
      const newAppointment = await this.appointmentRepo.save(appointment);

      const totalAmountWithoutPackage = appointment.serviceBilling.totalAmount;

      if (totalAmountWithoutPackage > 0) {
        await this.transactionService.create({
          userId: appointment.fetalRecords[0].mother.id,
          type: TransactionType.SERVICE_PAYMENT,
          status: TransactionStatus.SUCCESS,
          amount: totalAmountWithoutPackage,
          description: `Thanh toán cho các dịch vụ phát sinh trong cuộc hẹn ${appointmentId}`,
          serviceBillingId: appointment.serviceBilling.id,
        });
      }

      const appointmentHistoryList = await this.appointmentHistoryRepo.find({
        where: { appointment: { id: appointmentId } },
        order: { createdAt: 'ASC' },
      });

      const wasAwaitingDeposit = appointmentHistoryList.some(
        (history) =>
          history.status === AppointmentHistoryStatus.AWAITING_DEPOSIT,
      );

      if (wasAwaitingDeposit) {
        const depositAmount = 50000;
        // const discountAmount = Math.min(depositAmount, totalAmountWithoutPackage);

        await this.transactionService.create({
          userId: appointment.fetalRecords[0].mother.id,
          type: TransactionType.DEPOSIT_USAGE,
          status: TransactionStatus.SUCCESS,
          amount: depositAmount,
          description: `Sử dụng tiền cọc cho cuộc hẹn ${appointmentId}`,
          serviceBillingId: appointment.serviceBilling.id,
        });
      }
    }

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment,
      status: status as any,
      changedBy,
      notes: note,
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
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: [
        'fetalRecords',
        'doctor',
        'fetalRecords.mother',
        'serviceBilling',
      ], // Load cả serviceBilling
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Kiểm tra xem appointment đã có ServiceBilling chưa
    if (appointment.serviceBilling) {
      throw new BadRequestException(
        `Appointment ${appointmentId} đã có ServiceBilling với ID ${appointment.serviceBilling.id}. Không thể tạo mới.`,
      );
    }

    const user = appointment.fetalRecords[0].mother;

    const userServiceUsages = await this.userPackageServiceUsageRepo.find({
      where: { user, slot: MoreThan(0) },
      relations: ['service'],
    });

    const serviceBilling = this.serviceBillingRepo.create({
      appointment: appointment,
    });
    const savedServiceBilling =
      await this.serviceBillingRepo.save(serviceBilling);

    let totalAmountWithoutPackage: number = 0;
    const appointmentServices: AppointmentServiceEntity[] = [];

    for (const serviceUsed of servicesUsed) {
      const service = await this.serviceRepo.findOne({
        where: { id: serviceUsed.serviceId },
      });
      if (!service)
        throw new NotFoundException(
          `Service ${serviceUsed.serviceId} not found`,
        );

      let price = parseFloat(service.price as any);
      console.log(`Giá dịch vụ ${service.name}:`, price); // Thêm dòng này
      let isInPackage = false;

      const userServiceUsage = userServiceUsages.find(
        (usage) => usage.service.id === service.id && usage.slot > 0,
      );

      if (userServiceUsage) {
        userServiceUsage.slot--;
        await this.userPackageServiceUsageRepo.save(userServiceUsage);
        price = 0;
        isInPackage = true;
      } else {
        totalAmountWithoutPackage += price;
      }

      const newAppointmentService = this.appointmentServiceRepo.create({
        service,
        price,
        isInPackage,
        notes: serviceUsed.notes || '',
        serviceBilling: savedServiceBilling,
      });
      const savedAppointmentService = await this.appointmentServiceRepo.save(
        newAppointmentService,
      );
      console.log('app servicer', savedAppointmentService);

      appointmentServices.push(savedAppointmentService);
    }

    // Tạo transaction tổng cho các dịch vụ không nằm trong gói
    // if (totalAmountWithoutPackage > 0) {
    //   await this.transactionService.create({
    //     userId: user.id,
    //     type: TransactionType.SERVICE_PAYMENT,
    //     status: TransactionStatus.SUCCESS,
    //     amount: totalAmountWithoutPackage,
    //     description: `Thanh toán cho các dịch vụ phát sinh trong cuộc hẹn ${appointmentId}`,
    //     serviceBillingId: savedServiceBilling.id,
    //   });
    // }
    console.log('Tổng tiền không bao gồm gói:', totalAmountWithoutPackage);

    let finalAmount = totalAmountWithoutPackage;
    let discountAmount = 0;

    const appointmentHistoryList = await this.appointmentHistoryRepo.find({
      where: { appointment: { id: appointmentId } },
      order: { createdAt: 'ASC' },
    });

    const wasAwaitingDeposit = appointmentHistoryList.some(
      (history) => history.status === AppointmentHistoryStatus.AWAITING_DEPOSIT,
    );

    if (wasAwaitingDeposit) {
      const depositAmount = 50000;
      discountAmount = depositAmount;
      finalAmount = Math.max(0, totalAmountWithoutPackage - depositAmount);

      // await this.transactionService.create({
      //   userId: user.id,
      //   type: TransactionType.DEPOSIT_USAGE,
      //   status: TransactionStatus.SUCCESS,
      //   amount: discountAmount,
      //   description: `Sử dụng tiền cọc cho cuộc hẹn ${appointmentId}`,
      //   serviceBillingId: savedServiceBilling.id,
      // });
    }

    savedServiceBilling.totalAmount = totalAmountWithoutPackage;
    savedServiceBilling.discountAmount = discountAmount;
    savedServiceBilling.finalAmount = finalAmount;
    await this.serviceBillingRepo.save(savedServiceBilling);

    if (finalAmount > 0) {
      const amountToPay = finalAmount * 100;
      const param = `?appointmentId=${appointment.id}`;
      const paymentUrl = await this.vnpayService.createPayment(
        appointment.id,
        param,
        amountToPay.toString(),
      );
      return paymentUrl;
    }

    const appointmentHistory = this.appointmentHistoryRepo.create({
      appointment,
      status: AppointmentStatus.IN_PROGRESS as any,
      changedBy,
    });
    await this.appointmentHistoryRepo.save(appointmentHistory);
    appointment.status = AppointmentStatus.IN_PROGRESS;
    const newAppointment = await this.appointmentRepo.save(appointment);
    return {
      appointment: newAppointment,
      bill: savedServiceBilling,
      // services: appointmentServices,
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
        where: {
          appointment: { id: appointment.id },
          fetalRecord: { id: fetalRecord.id },
        },
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
      totalPrice,
    });
    const savedBill = await this.medicationBillRepo.save(medicationBill);
    const details: MedicationBillDetail[] = [];

    for (const med of medications) {
      const medication = await this.medicationRepo.findOne({
        where: { id: med.medicationId },
      });

      if (!medication)
        throw new NotFoundException(`Medication ${med.medicationId} not found`);

      const total = medication.price * med.quantity;
      totalPrice += total;
      console.log(total);

      const detail = this.medicationBillDetailRepo.create({
        bill: medicationBill,
        medication,
        quantity: med.quantity,
        price: medication.price,
        total,
      });
      console.log('tới đây r');

      details.push(detail);
    }
    await this.medicationBillDetailRepo.save(details);
    savedBill.totalPrice = totalPrice;
    await this.medicationBillRepo.save(savedBill);

    console.log('MedicationBill object before save:', medicationBill);
    console.log('MedicationBill ID before save:', medicationBill.id);
    try {
      const bill = await this.medicationBillRepo.save(medicationBill);
    } catch (error) {
      console.error('Error saving detail:', error);

      throw error; // Re-throw lỗi để không bỏ sót
    }
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
        'appointments.serviceBilling',
        'appointments.serviceBilling.appointmentServices',
        'appointments.serviceBilling.appointmentServices.service',
        'appointments.medicationBills',
        'appointments.fetalRecords', // Cập nhật relations
        'appointments.slot',
        'appointments.history',
        'appointments.history.changedBy',
        'checkupRecords',
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
        'serviceBilling.appointmentServices',
        'serviceBilling.appointmentServices.service',
        'medicationBills',
        'fetalRecords.mother',
        'history',
        'history.changedBy',
        'slot',
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
        'serviceBilling.appointmentServices',
        'serviceBilling.appointmentServices.service',
        'medicationBills',
        'fetalRecords.mother',
        'history',
        'history.changedBy',
        'slot',
      ],
    });
  }

  async getDoctorAppointmentsByDateWithSearch(
    doctorId: string,
    date: Date,
    search?: string,
    status?: AppointmentStatus,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.fetalRecords', 'fetalRecord')
      .leftJoinAndSelect('fetalRecord.checkupRecords', 'checkupRecord')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.serviceBilling', 'serviceBilling')
      // Truy cập AppointmentServiceEntity thông qua serviceBilling
      .leftJoinAndSelect(
        'serviceBilling.appointmentServices',
        'appointmentServices',
      )
      .leftJoinAndSelect('appointmentServices.service', 'service') // Load thông tin dịch vụ của AppointmentService
      .leftJoinAndSelect('appointment.medicationBills', 'medicationBills')
      .leftJoinAndSelect('fetalRecord.mother', 'mother')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .leftJoinAndSelect('appointment.history', 'history')
      .leftJoinAndSelect('history.changedBy', 'changedBy')
      .where('appointment.doctor.id = :doctorId', { doctorId })
      .andWhere(
        'appointment.appointmentDate BETWEEN :startOfDay AND :endOfDay',
        { startOfDay, endOfDay },
      );

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(mother.fullName LIKE :search OR mother.phone LIKE :search OR mother.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async getAllAppointmentsByDateWithSearch(
    date: Date,
    search?: string,
    status?: AppointmentStatus,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.fetalRecords', 'fetalRecord')
      .leftJoinAndSelect('fetalRecord.checkupRecords', 'checkupRecord')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.serviceBilling', 'serviceBilling')
      // Truy cập AppointmentServiceEntity thông qua serviceBilling
      .leftJoinAndSelect(
        'serviceBilling.appointmentServices',
        'appointmentServices',
      )
      .leftJoinAndSelect('appointmentServices.service', 'service') // Load thông tin dịch vụ của AppointmentService
      .leftJoinAndSelect('appointment.medicationBills', 'medicationBills')
      .leftJoinAndSelect('fetalRecord.mother', 'mother')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .leftJoinAndSelect('appointment.history', 'history')
      .leftJoinAndSelect('history.changedBy', 'changedBy')
      .andWhere(
        'appointment.appointmentDate BETWEEN :startOfDay AND :endOfDay',
        { startOfDay, endOfDay },
      );

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(mother.fullName LIKE :search OR mother.phone LIKE :search OR mother.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async previewCheckup(appointmentId: string, servicesUsed: ServiceUsedDto[]) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['fetalRecords', 'fetalRecords.mother'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const user = appointment.fetalRecords[0].mother;

    const userServiceUsages = await this.userPackageServiceUsageRepo.find({
      where: { user, slot: MoreThan(0), order: { isActive: true } },
      relations: ['service', 'order'],
    });

    let totalCostWithoutPackage = 0;
    const servicePreviews: {
      id: string;
      name: string;
      price: number;
      isInPackage: boolean;
    }[] = [];

    for (const serviceUsed of servicesUsed) {
      const service = await this.serviceRepo.findOne({
        where: { id: serviceUsed.serviceId },
      });
      if (!service)
        throw new NotFoundException(
          `Service ${serviceUsed.serviceId} not found`,
        );

      const price = Number(service.price); // Chuyển đổi giá sang number
      let isInPackage = false;

      for (const usage of userServiceUsages) {
        if (usage.service.id === service.id && usage.slot > 0) {
          isInPackage = true;
          break;
        }
      }

      if (!isInPackage) {
        totalCostWithoutPackage += price; // Cộng giá trị number
      }

      servicePreviews.push({
        id: service.id,
        name: service.name,
        price,
        isInPackage,
      });
    }

    const appointmentHistoryList = await this.appointmentHistoryRepo.find({
      where: { appointment: { id: appointmentId } },
      order: { createdAt: 'ASC' },
    });

    const wasAwaitingDeposit = appointmentHistoryList.some(
      (history) => history.status === AppointmentHistoryStatus.AWAITING_DEPOSIT,
    );

    const depositAmount = wasAwaitingDeposit ? 50000 : 0;
    const finalCost = Math.max(0, totalCostWithoutPackage - depositAmount); // Tính toán finalCost

    return {
      services: servicePreviews,
      totalCostWithoutPackage,
      depositAmount,
      finalCost,
    };
  }
}
