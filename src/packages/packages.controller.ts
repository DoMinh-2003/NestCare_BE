import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CustomHttpException } from 'src/common/exceptions';
import { Packages } from './package.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import { CreatePackageDto, SearchWithPaginationDto } from './dto';
import { formatResponse, validatePaginationInput } from 'src/utils';

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

   @Public()
         @HttpCode(HttpStatus.OK)
         @Post('search')
         async getServices(@Body() model: SearchWithPaginationDto) {
          validatePaginationInput(model);
           const packages: SearchPaginationResponseModel<Packages> =
             await this.packagesService.getPackages(model);
           return formatResponse<SearchPaginationResponseModel<Packages>>(packages);
         }
     

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
}
