import { Controller, Get, Post, Body, Patch, Param, Delete, Request, HttpStatus } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CustomHttpException } from 'src/common/exceptions';
import { formatResponse } from 'src/utils';
import { Medication } from './medication.entity';
import { CreateMedicationDto } from './dto';

@Controller('api/medication')
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

  @Get()
  findAll() {
    return this.medicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicationDto: UpdateMedicationDto) {
    return this.medicationService.update(+id, updateMedicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicationService.remove(+id);
  }
}
