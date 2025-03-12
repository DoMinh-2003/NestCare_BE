// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Delete,
//   Request,
//   HttpStatus,
//   HttpCode,
//   Req,
//   Put,
//   NotFoundException,
// } from '@nestjs/common';
// import { MedicationService } from './medication.service';
// import { UpdateMedicationDto } from './dto/update.dto';
// import { Public } from 'src/auth/decorators/public.decorator';
// import { CustomHttpException } from 'src/common/exceptions';
// import { formatResponse, validatePaginationInput } from 'src/utils';
// import { Medication } from './medication.entity';
// import {
//   CreateMedicationDto,
//   SearchMedicationsDto,
//   SearchWithPaginationDto,
// } from './dto';
// import { SearchPaginationResponseModel } from 'src/common/models';
// import { Api } from 'src/common/api';
// import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

// @ApiTags('Medication')
// @Controller(Api.medication)
// export class MedicationController {
//   constructor(private readonly medicationService: MedicationService) {}

//   @Public()
//   @ApiBearerAuth()
//   @Post('create')
//   async createPackage(@Body() model: CreateMedicationDto, @Request() req) {
//     if (!model) {
//       throw new CustomHttpException(
//         HttpStatus.NOT_FOUND,
//         'You need to send data',
//       );
//     }
//     const medication = await this.medicationService.createMedication(model);

//     return formatResponse<Medication>(medication);
//   }

//   @Public()
//   @ApiBody({ type: SearchMedicationsDto })
//   @HttpCode(HttpStatus.OK)
//   @Post('search')
//   async getMedications(@Body() model: SearchWithPaginationDto) {
//     validatePaginationInput(model);
//     const medications: SearchPaginationResponseModel<Medication> =
//       await this.medicationService.getMedications(model);
//     return formatResponse<SearchPaginationResponseModel<Medication>>(
//       medications,
//     );
//   }

//   @Public()
//   @Get(':id')
//   async getPackage(@Param('id') id: string) {
//     const item = await this.medicationService.getMedication(id);
//     if (!item) {
//       throw new NotFoundException('Package not found');
//     }
//     return formatResponse<Medication>(item);
//   }

//   @Public()
//   @ApiBearerAuth()
//   @ApiBody({ type: UpdateMedicationDto })
//   @Put(':id')
//   async updateService(
//     @Param('id') id: string,
//     @Body() model: UpdateMedicationDto,
//     @Req() req,
//   ) {
//     if (!model) {
//       throw new CustomHttpException(
//         HttpStatus.BAD_REQUEST,
//         'You need to send data',
//       );
//     }
//     const medication = await this.medicationService.updateMedication(
//       id,
//       model,
//       req.user,
//     );
//     return formatResponse<Medication>(medication);
//   }

//   @Public()
//   @ApiBearerAuth()
//   @Delete(':id')
//   async deletePackage(@Param('id') id: string) {
//     const result = await this.medicationService.deleteMedication(id);
//     return formatResponse<boolean>(result);
//   }
// }
