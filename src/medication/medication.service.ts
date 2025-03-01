import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medication } from './medication.entity';
import { Repository } from 'typeorm';
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
