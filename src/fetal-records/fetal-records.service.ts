import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFetalRecordDto } from './dto/create-fetal-record.dto';
import { UpdateFetalRecordDto } from './dto/update-fetal-record.dto';
import { Repository } from 'typeorm';
import { FetalRecord } from './entities/fetal-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/model/user.entity';
import { CheckupRecord } from 'src/appointment/entities/checkupRecord.entity';
import { CreateCheckupRecordDto } from './dto/create-checkup-record.dto';

@Injectable()
export class FetalRecordsService {
  constructor(
    @InjectRepository(FetalRecord)
    private readonly fetalRecordRepository: Repository<FetalRecord>,

      @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(CheckupRecord)
        private readonly checkupRecordRepo: Repository<CheckupRecord>,
        
  ) {}

  // Thêm hồ sơ thai nhi
  async create(createFetalRecordDto: CreateFetalRecordDto): Promise<FetalRecord> {
    const { motherId: userId, ...otherFields } = createFetalRecordDto;  
    // Find the User entity from the provided user_id
    const mother = await this.userRepository.findOne({where: { id: userId}});
  
    if (!mother) {
      throw new Error('Mother (User) not found');
    }
  
    const fetalRecord = this.fetalRecordRepository.create({
      ...otherFields,
      mother, // Associate the User entity with the fetal record
    });
  
    return await this.fetalRecordRepository.save(fetalRecord);
  }

  // Lấy tất cả hồ sơ thai nhi của một người mẹ (user)
  async findAllByUserId(userId: string): Promise<FetalRecord[]> {
    return await this.fetalRecordRepository.find({
      where: { mother: { id: userId }, isDeleted: 0 }, // Kiểm tra isDeleted = 0 để chỉ lấy các hồ sơ chưa bị xóa
      relations: ['checkupRecords','checkupRecords.appointment','appointments', 'mother']
    });
  }

  // Tìm hồ sơ thai nhi theo ID
  async findById(idFetal: string) {
    const fetalRecord = await this.fetalRecordRepository.findOne({
      where: { id: idFetal, isDeleted: 0 }, // Chỉ định điều kiện tìm theo id
      relations: ['checkupRecords','checkupRecords.appointment','appointments', 'mother']
    });

    if (!fetalRecord) {
      throw new NotFoundException(`FetalRecord with ID ${idFetal} not found`);
    }

    return fetalRecord;
  }


  async createCheckupRecord(fetalId: string, dto: CreateCheckupRecordDto) {
    const fetalRecord = await this.fetalRecordRepository.findOne({ where: { id: fetalId } });
    if (!fetalRecord) {
      throw new NotFoundException('Fetal record not found');
    }

    const checkupRecord = this.checkupRecordRepo.create({
      ...dto,
      fetalRecord,
    });

    return this.checkupRecordRepo.save(checkupRecord);
  }

  async update(
    id: string,
    updateFetalRecordDto: UpdateFetalRecordDto,
  ): Promise<FetalRecord> {
    await this.fetalRecordRepository.update(id, updateFetalRecordDto);
    const fetalRecord = await this.findById(id);
    return fetalRecord;
  }


  // Xóa hồ sơ thai nhi (xóa mềm)
  async remove(id: string): Promise<void> {
    await this.fetalRecordRepository.update(id, { isDeleted: 1 });
  }
}
