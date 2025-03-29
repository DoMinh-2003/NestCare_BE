import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './entities/reminder.entity';
import { MailService } from 'src/common/service/mail.service';
import { CreateReminderDto } from './dto/createReminderDTO';
import { User } from 'src/users/model/user.entity';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly mailService: MailService, // Inject MailService để gửi email
  ) { }

  async createReminder(reminderDto: CreateReminderDto, doctorId: string) {
    // ✅ Tìm user theo ID (mẹ bầu)
    const mother = await this.userRepository.findOne({
      where: { id: reminderDto.motherId },
    });
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
    });

    if (!mother || !doctor) {
      throw new NotFoundException('Mẹ bầu hoặc bác sĩ không tồn tại.');
    }

    const reminder = this.reminderRepository.create({ ...reminderDto, mother, doctor });
    const savedReminder = await this.reminderRepository.save(reminder); // Đảm bảo chỉ lưu 1 object

    this.scheduleDailyReminder(savedReminder); // Lên lịch gửi email

    return savedReminder;
  }

  private scheduleDailyReminder(reminder: Reminder) {
    const now = new Date();
    const startDate = new Date(reminder.startDate);
    const endDate = new Date(reminder.endDate);

    if (now > startDate) {
      this.logger.warn(`Bỏ qua nhắc nhở ${reminder.title} vì đã quá hạn.`);
      throw new BadRequestException(
        'Ngày bắt đầu không thể nhỏ hơn ngày hiện tại.',
      );
    }

    // Lặp mỗi ngày từ startDate đến endDate
    let currentDate = startDate;
    while (currentDate <= endDate) {
      this.scheduleReminderForDay(reminder, new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // Chuyển sang ngày tiếp theo
    }
  }

  private scheduleReminderForDay(reminder: Reminder, reminderDate: Date) {
    const now = new Date();
    const reminderDateTime = new Date(
      reminderDate.toISOString().split('T')[0] + `T${reminder.reminderTime}:00`,
    );

    if (reminderDateTime <= now) return; // Nếu lịch nhắc nhỏ hơn hiện tại thì bỏ qua

    const delay = reminderDateTime.getTime() - now.getTime();
    this.logger.log(
      `Lên lịch gửi email nhắc nhở "${reminder.title}" vào ${reminderDateTime}`,
    );

    setTimeout(async () => {
      await this.sendEmailReminder(reminder);
    }, delay);
  }

  private async sendEmailReminder(reminder: Reminder) {
    console.log(reminder);
    try {
      await this.mailService.sendWelcomeEmail(
        reminder.mother.email, // Email của người nhận
        `Nhắc nhở: ${reminder.title}`,
        reminder.description, // Nội dung email
      );

      this.logger.log(
        `✅ Đã gửi email nhắc nhở: ${reminder.title} đến ${reminder.mother.email}`,
      );
    } catch (error) {
      this.logger.error(`❌ Lỗi khi gửi email nhắc nhở: ${error.message}`);
    }
  }

  async loadAllReminders() {
    const reminders = await this.reminderRepository.find({
      relations: ['mother'],
    });

    for (const reminder of reminders) {
      this.scheduleDailyReminder(reminder);
    }
  }

  async getRemindersByMotherId(motherId: string) {
    const mother = await this.userRepository.findOne({
      where: { id: motherId },
    });

    if (!mother) {
      throw new NotFoundException('Mẹ bầu không tồn tại.');
    }

    const reminders = await this.reminderRepository.find({
      where: { mother: { id: motherId } },
      relations: ['mother'],
      order: { startDate: 'ASC' },
    });

    return reminders;
  }

  async getRemindersCreatedByDoctor(doctorId: string) {
    const doctor = await this.userRepository.findOne({ where: { id: doctorId } });

    if (!doctor) throw new NotFoundException('Bác sĩ không tồn tại.');

    return this.reminderRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['mother', 'doctor'],
      order: { startDate: 'DESC' },
    });
  }


}
