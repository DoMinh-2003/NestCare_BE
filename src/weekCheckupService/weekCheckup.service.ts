import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';

import { Services } from 'src/services/services.entity';
import { CreateWeekCheckupDto } from './dto/CreateWeekCheckupDto';
import { UpdateWeekCheckupDto } from './dto/UpdateWeekCheckupDto';
import { WeekCheckupServiceEntity } from './entities/WeekCheckupService.entity';
import { MailService } from 'src/common/service/mail.service';
import { FetalRecord, PregnancyStatus } from 'src/fetal-records/entities/fetal-record.entity';
import { UserPackageServiceUsage } from 'src/users/model/userPackageServiceUsage.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { CheckupRecord } from 'src/appointment/entities/checkupRecord.entity';

@Injectable()
export class WeekCheckupService {
  constructor(
    @InjectRepository(WeekCheckupServiceEntity)
    private readonly weekCheckupRepo: Repository<WeekCheckupServiceEntity>,

    @InjectRepository(Services)
    private readonly serviceRepo: Repository<Services>,

    @InjectRepository(FetalRecord)
    private fetalRecordRepo: Repository<FetalRecord>,

    
    @InjectRepository(UserPackageServiceUsage)
    private userPackageServiceUsageRepo: Repository<UserPackageServiceUsage>,

    

    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,


    @InjectRepository(CheckupRecord)
    private checkupRecordRepo: Repository<CheckupRecord>,

    private mailService: MailService,
  ) {}

  async create(dto: CreateWeekCheckupDto) {
    const services = await this.serviceRepo.findByIds(dto.serviceIds); // Đổi thành serviceIds
    const weekCheckup = this.weekCheckupRepo.create({
      ...dto,
      services,
    });
    return this.weekCheckupRepo.save(weekCheckup);
  }

  async findAll() {
    return this.weekCheckupRepo.find({ relations: ['services'] });
  }

  async update(id: string, dto: UpdateWeekCheckupDto) {
    const weekCheckup = await this.weekCheckupRepo.findOne({
      where: { id: id },
      relations: ['services'],
    });
    if (!weekCheckup) throw new NotFoundException('Week Checkup not found');

    const services = dto.serviceIds
      ? await this.serviceRepo.findByIds(dto.serviceIds)
      : weekCheckup.services;
    Object.assign(weekCheckup, { ...dto, services });

    return this.weekCheckupRepo.save(weekCheckup);
  }

  async delete(id: string): Promise<void> {
    const result = await this.weekCheckupRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Week Checkup not found');
  }



  async sendWeeklyCheckupReminders() {
    const today = new Date();
  
    // Tìm tất cả các thai nhi có status PREGNANT
    const fetalRecords = await this.fetalRecordRepo.find({
      where: { status: PregnancyStatus.PREGNANT },
      relations: ['mother'],
    });
  
    for (const fetal of fetalRecords) {
        console.log(new Date(fetal.dateOfPregnancyStart));
      const weeksPregnant = this.calculateWeeksPregnant(new Date(fetal.dateOfPregnancyStart));
           console.log(weeksPregnant);
      // Kiểm tra tuần khám phù hợp
      const weekCheckup = await this.weekCheckupRepo.findOne({
        where: { week: weeksPregnant },
        relations: ['services'],
      });
  
      if (!weekCheckup) continue;
  
      // Kiểm tra mẹ có gói dịch vụ nào không và còn slot không
      const hasActivePackage = await this.userPackageServiceUsageRepo.findOne({
        where: {
          user: fetal.mother,
          slot: MoreThan(0), // Chỉ lấy những gói còn slot
        },
      });

      if (!hasActivePackage) continue; // Nếu không có gói hợp lệ, bỏ qua
  
      // Kiểm tra mẹ có Appointment hoặc CheckupRecord trong tuần này không
      const startOfWeek = this.getStartOfWeek(today);
      const endOfWeek = this.getEndOfWeek(today);
  
      const hasRecentAppointment = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .innerJoin('appointment.fetalRecords', 'fetalRecord')
      .where('fetalRecord.id = :fetalId', { fetalId: fetal.id })
      .andWhere('appointment.appointmentDate BETWEEN :startOfWeek AND :endOfWeek', {
        startOfWeek,
        endOfWeek,
      })
      .getOne();
  
      const hasRecentCheckup = await this.checkupRecordRepo.findOne({
        where: {
          fetalRecord: fetal,
          createdAt: Between(startOfWeek, endOfWeek),
        },
      });
  
      if (hasRecentAppointment || hasRecentCheckup) continue; // Nếu đã có thì không gửi mail nữa

      const serviceNames = weekCheckup.services.map(service => service.name);

  
      // Gửi email thông báo khám thai
      await this.mailService.sendCheckupReminder(
        fetal.mother.email,
        `Lịch khám thai tuần ${weeksPregnant}`,
        weekCheckup.title,
        weekCheckup.description,
        serviceNames
      );
  
      console.log(`Email sent to ${fetal.mother.email} for week ${weeksPregnant}`);
    }
  }
  
  private calculateWeeksPregnant(startDate: Date): number {
    const now = new Date();
    const diffInMs = now.getTime() - startDate.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
  }
  
  // Hàm lấy ngày bắt đầu của tuần hiện tại
  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    return start;
  }
  
  // Hàm lấy ngày kết thúc của tuần hiện tại
  private getEndOfWeek(date: Date): Date {
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
    end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));
    return end;
  }
  
}
