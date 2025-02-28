import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MedicationService } from './medication.service';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CustomHttpException } from 'src/common/exceptions';
import { formatResponse, validatePaginationInput } from 'src/utils';
import { Medication } from './medication.entity';
import { CreateMedicationDto, SearchMedicationsDto, SearchWithPaginationDto } from './dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import { Api } from 'src/common/api';
import { ApiBody } from '@nestjs/swagger';

@Controller(Api.medication)
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Public()
  @Post('create')
  async createPackage(@Body() model: CreateMedicationDto, @Request() req) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }
    const medication = await this.medicationService.createMedication(model);

    return formatResponse<Medication>(medication);
  }

  @Public()
  @ApiBody({type: SearchMedicationsDto})
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async getMedications(@Body() model: SearchWithPaginationDto) {
    validatePaginationInput(model);
    const medications: SearchPaginationResponseModel<Medication> =
      await this.medicationService.getMedications(model);
    return formatResponse<SearchPaginationResponseModel<Medication>>(medications);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return this.medicationService.update(+id, updateMedicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicationService.remove(+id);
  }
}
