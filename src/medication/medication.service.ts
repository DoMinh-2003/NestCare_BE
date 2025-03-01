import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from './medication.entity';
import { Repository } from 'typeorm';
import { CreateMedicationDto } from './dto';
import { isEmptyObject } from 'src/utils';
import { CustomHttpException } from 'src/common/exceptions';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
  ) {}
  async createMedication(model: CreateMedicationDto) {
    if (isEmptyObject(model)) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Model data is empty',
      );
    }

    const existingMedication = await this.medicationRepository.findOne({
      where: { name: model.name },
    });
    if (existingMedication) {
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `A medication with this name: "${model.name}" already exists`,
      );
    }
    const newMedication = this.medicationRepository.create({
      ...model,
    });

    return await this.medicationRepository.save(newMedication);
  }

  findAll() {
    return `This action returns all medication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medication`;
  }

  update(id: number, updateMedicationDto: UpdateMedicationDto) {
    return `This action updates a #${id} medication`;
  }

  remove(id: number) {
    return `This action removes a #${id} medication`;
  }
}
