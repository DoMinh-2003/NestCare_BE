import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Api } from 'src/common/api';
import { Public } from 'src/auth/decorators/public.decorator';
import { formatResponse, isEmptyObject } from 'src/utils/helpers';
import { CustomHttpException } from 'src/common/exceptions';
import { Services } from './services.entity';
import SearchWithPaginationDto from './dto/searchWithPagination.dto';
import { SearchPaginationResponseModel } from 'src/common/models';

@Controller(Api.services)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Post('create')
  async create(@Body() model) {
    if(!model){
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
  }
    const service = await this.servicesService.createService(model);
    
          return formatResponse<Services>(service);
  }

   @Public()
       @HttpCode(HttpStatus.OK)
       @Post('search')
       async getServices(@Body() model: SearchWithPaginationDto) {
        if(!model){
          throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
      }
         const services: SearchPaginationResponseModel<Services> =
           await this.servicesService.getSevices(model);
         return formatResponse<SearchPaginationResponseModel<Services>>(services);
       }
   

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Public()
        @Delete(':id')
        async deleteService(@Param('id') id: string) {
          const result = await this.servicesService.deleteService(id);
          return formatResponse<boolean>(result);
        }
}
