import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req } from '@nestjs/common';
import { FetalRecordsService } from './fetal-records.service';
import { CreateFetalRecordDto } from './dto/create-fetal-record.dto';
import { UpdateFetalRecordDto } from './dto/update-fetal-record.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Api } from 'src/common/api';
import { CreateCheckupRecordDto } from './dto/create-checkup-record.dto';

@ApiTags("FetalRecords")
@Controller(Api.fetalRecord)
@ApiBearerAuth()
export class FetalRecordsController {
  constructor(private readonly fetalRecordsService: FetalRecordsService) { }

  @ApiBody({ type: CreateFetalRecordDto })
  @Post()
  async create(@Body() createFetalRecordDto: CreateFetalRecordDto) {
    return await this.fetalRecordsService.create(createFetalRecordDto);
  }


  @Get()
  async findAll(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return await this.fetalRecordsService.findAllByUserId(userId);
  }


  @Post('checkup-records/:fetalId')
  @ApiBody({ type: CreateCheckupRecordDto })
  async addCheckupRecord(
    @Param('fetalId') fetalId: string,
    @Body() createCheckupRecordDto: CreateCheckupRecordDto,
  ) {
    return this.fetalRecordsService.createCheckupRecord(fetalId, createCheckupRecordDto);
  }


  // API để tìm hồ sơ thai nhi theo ID
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.fetalRecordsService.findById(id);
  }

  @ApiBody({ type: UpdateFetalRecordDto })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFetalRecordDto: UpdateFetalRecordDto,
  ) {
    return await this.fetalRecordsService.update(id, updateFetalRecordDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.fetalRecordsService.remove(id);
  }
}
