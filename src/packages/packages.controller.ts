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
  Put,
  Req,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CustomHttpException } from 'src/common/exceptions';
import { Packages } from './entity/package.entity';
import { SearchPaginationResponseModel } from 'src/common/models';
import {
  CreatePackageDto,
  SearchPackagesDto,
  SearchWithPaginationDto,
  UpdatePackageDto,
} from './dto';
import { formatResponse, validatePaginationInput } from 'src/utils';
import { Api } from 'src/common/api';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller(Api.packages)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreatePackageDto })
  @Post()
  async createPackage(@Body() model: CreatePackageDto, @Request() req) {
    // Kiểm tra xem dữ liệu có hợp lệ không
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }

    // Tạo gói dịch vụ mới thông qua service
    const item = await this.packagesService.createPackage(model);

    // Trả về kết quả sau khi tạo
    return formatResponse<Packages>(item);
  }

  @Public()
    @ApiBody({type: SearchPackagesDto})
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

  @Public()
  @ApiResponse({ status: 200, description: 'Get all packages with services and slots', type: [Packages] })
  @Get()
  async getAllPackages() {
    try {
      const packages = await this.packagesService.getAllPackages();
      return formatResponse<Packages[]>(packages);
    } catch (error) {
      throw new CustomHttpException(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdatePackageDto })
  @Put(':id')
  async updateService(
    @Param('id') id: string,
    @Body() model: UpdatePackageDto,
    @Req() req,
  ) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        'You need to send data',
      );
    }

    // Cập nhật gói dịch vụ thông qua service
    const item = await this.packagesService.updatePackage(id, model, req.user);

    // Trả về kết quả sau khi cập nhật
    return formatResponse<Packages>(item);
  }

  @Public()
  @ApiBearerAuth()
  @Delete(':id')
  async deletePackage(@Param('id') id: string) {
    const result = await this.packagesService.deletePackage(id);
    return formatResponse<boolean>(result);
  }
}
