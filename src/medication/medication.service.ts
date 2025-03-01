import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateMedicationDto } from './dto/update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from './medication.entity';
import { Not, Repository } from 'typeorm';
import {
  CreateMedicationDto,
  SearchMedicationsDto,
  SearchWithPaginationDto,
} from './dto';
import { formatPaginationResult, isEmptyObject } from 'src/utils';
import { CustomHttpException } from 'src/common/exceptions';
import { SearchPaginationResponseModel } from 'src/common/models';

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

  async getMedications(
    model: SearchWithPaginationDto,
  ): Promise<SearchPaginationResponseModel<Medication>> {
    const searchCondition = {
      ...new SearchMedicationsDto(),
      ...model.searchCondition,
    };
    console.log(searchCondition);
    const { keyword, isDeleted } = searchCondition;
    const { pageNum, pageSize } = model.pageInfo;
    const query = this.medicationRepository.createQueryBuilder('medication');

    if (keyword) {
      query.andWhere('medication.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    query.andWhere('medication.isDeleted = :isDeleted', {
      isDeleted,
    });

    query.orderBy('medication.createdAt', 'DESC');

    query.skip((pageNum - 1) * pageSize).take(pageSize);

    const [medications, total] = await query.getManyAndCount();
    const data = new SearchPaginationResponseModel<Medication>();
    const result = formatPaginationResult<Medication>(data, medications, {
      pageNum,
      pageSize,
      totalItems: total,
      totalPages: 0,
    });

    return result;
  }

  async getMedication(id: string): Promise<Medication | null> {
        return await this.medicationRepository.findOne({
          where: { id, isDeleted: 0 },
        });
        }
  
    async updateMedication(id: string, model: UpdateMedicationDto, user): Promise<Medication> {
            
            const medication = await this.getMedication(id);
        
            if (!medication) {
              throw new CustomHttpException(
                HttpStatus.NOT_FOUND,
                `A medication with this id: "${id}" does not exist`,
              );
            }
        
            if (model.name) {
              const existingMedication = await this.medicationRepository.findOne({
                where: { name: model.name, id: Not(id) },
              });
              if (existingMedication) {
                throw new CustomHttpException(
                  HttpStatus.BAD_REQUEST,
                  `A medication with name "${model.name}" already exists.`,
                );
              }
            }
        
            // Chỉ cập nhật các trường được truyền vào
            const updatedMedication = Object.assign(medication, model, { updatedAt: new Date() });
        
            return await this.medicationRepository.save(updatedMedication);
          }
  
          async deleteMedication(id: string): Promise<boolean> {
            const medication = await this.getMedication(id);
            if (!medication) {
              throw new CustomHttpException(
                HttpStatus.BAD_REQUEST,
                `A medication with this id: "${id}" not exists`,
              );
            }
            await this.medicationRepository.update(id, { isDeleted: 1 });
            return true;
          }
}
