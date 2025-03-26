import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Slot } from './entities/slot.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    // @InjectRepository(Appointment)
    // private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async createOrUpdateSlots(
    startTime: string,
    endTime: string,
    duration: number,
  ) {
    // Vô hiệu hóa tất cả các slot hiện có
    await this.slotRepo.update({}, { isActive: false });

    // Tạo các slot mới
    const startDate = new Date();
    const endDate = new Date();

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    startDate.setHours(startHours, startMinutes, 0, 0);
    endDate.setHours(endHours, endMinutes, 0, 0);

    const slots: Slot[] = [];
    let currentSlotTime = new Date(startDate);

    while (currentSlotTime < endDate) {
      const slot = this.slotRepo.create({
        startTime: `${currentSlotTime.getHours().toString().padStart(2, '0')}:${currentSlotTime.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${new Date(currentSlotTime.getTime() + duration * 60000).getHours().toString().padStart(2, '0')}:${new Date(currentSlotTime.getTime() + duration * 60000).getMinutes().toString().padStart(2, '0')}`,
        // duration,
        isActive: true, // Đặt isActive thành true cho các slot mới
      });
      slots.push(slot);
      currentSlotTime = new Date(currentSlotTime.getTime() + duration * 60000);
    }

    return await this.slotRepo.save(slots);
  }

  async getAllSlots() {
    return await this.slotRepo.find({
      where: { isActive: true },
      order: { startTime: 'ASC' }, // Sắp xếp theo startTime tăng dần
    });
  }

  // async getAvailableSlots(date: Date, doctorId: string) {
  //   const slots = await this.slotRepo.find({
  //     where: {
  //       isActive: true,
  //     },
  //   });

  //   const appointments = await this.appointmentRepo.find({
  //     where: {
  //       doctor: { id: doctorId },
  //       appointmentDate: Between(
  //         new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  //         new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
  //       ),
  //     },
  //   });

  //   const availableSlots = slots.filter(slot => {
  //     const slotStartTime = new Date(date);
  //     const [hours, minutes] = slot.startTime.split(':');
  //     slotStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  //     return !appointments.some(appointment => {
  //       const appointmentTime = new Date(appointment.appointmentDate);
  //       return appointmentTime.getTime() === slotStartTime.getTime();
  //     });
  //   });

  //   return availableSlots;
  // }

  async updateSlot(id: string, data: Partial<Slot>) {
    const slot = await this.slotRepo.findOne({ where: { id } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    Object.assign(slot, data);
    return await this.slotRepo.save(slot);
  }

  async deleteSlot(id: string) {
    const slot = await this.slotRepo.findOne({ where: { id } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    slot.isActive = false;
    return await this.slotRepo.save(slot);
  }
}