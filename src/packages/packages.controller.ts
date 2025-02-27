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
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CustomHttpException } from 'src/common/exceptions';
import { formatResponse } from 'src/utils';
import { Packages } from './package.entity';
import CreatePackageDto from './dto/create.dto';

@Controller('api/packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Public()
  @Post('create')
  async createPackage(@Body() model: CreatePackageDto, @Request() req) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }
    const item = await this.packagesService.createPackage(model);

    return formatResponse<Packages>(item);
  }

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
}
