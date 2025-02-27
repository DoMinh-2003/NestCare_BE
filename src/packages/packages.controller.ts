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
  NotFoundException,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CustomHttpException } from 'src/common/exceptions';
import { Packages } from './package.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import { CreatePackageDto, SearchWithPaginationDto } from './dto';
import { formatResponse, validatePaginationInput } from 'src/utils';
import { Api } from 'src/common/api';

@Controller(Api.packages)
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
     

  @Public()
    @Get(':id')
    async getPackage(@Param('id') id: string) {
      const item = await this.packagesService.getPackage(id);
      if (!item) {
        throw new NotFoundException('Package not found');
      }
      return formatResponse<Packages>(item);
    }

 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
}
