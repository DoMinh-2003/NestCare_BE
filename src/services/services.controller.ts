import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  NotFoundException,
  Req,
  Put,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { Api } from 'src/common/api';
import { Public } from 'src/auth/decorators/public.decorator';
import { formatResponse } from 'src/utils/helpers';
import { CustomHttpException } from 'src/common/exceptions';
import { Services } from './services.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import {
  CreateServicesDto,
  SearchWithPaginationDto,
  UpdateServiceDto,
} from './dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Services')
@Controller(Api.services)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}


  @ApiBearerAuth()
  @ApiBody({ type: CreateServicesDto })
  @Post()
  async create(@Body() model: CreateServicesDto) {
    if (!model) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'You need to send data');
    }
    const service = await this.servicesService.createService(model);
    return { statusCode: HttpStatus.CREATED, message: 'Service created successfully', data: service };
  }


  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async getServices(@Body() model: SearchWithPaginationDto) {
    console.log(model);
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }
    const services: SearchPaginationResponseModel<Services> =
      await this.servicesService.getSevices(model);
    return formatResponse<SearchPaginationResponseModel<Services>>(services);
  }

  @Public()
  @Get(':id')
  async getService(@Param('id') id: string) {
    const service = await this.servicesService.getService(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return formatResponse<Services>(service);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateServiceDto })
  @Put(':id')
  async updateService(@Param('id') id: string, @Body() model: UpdateServiceDto) {
    if (!model) {
      throw new CustomHttpException(HttpStatus.BAD_REQUEST, 'You need to send data');
    }

    const service = await this.servicesService.updateService(id, model);
    return { statusCode: HttpStatus.OK, message: 'Service updated successfully', data: service };
  }

  @Public()
  @Get()
  async getAllServices() {
    const services = await this.servicesService.getAllServices();
    return formatResponse<Services[]>(services);
  }

  
    @ApiBearerAuth()
  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    const result = await this.servicesService.deleteService(id);
    return formatResponse<boolean>(result);
  }
}
