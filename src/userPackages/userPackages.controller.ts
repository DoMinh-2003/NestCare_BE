import { Controller, Post, Param, Body, Get, Put, Req, Query } from '@nestjs/common';

import { ApiTags, ApiBearerAuth, ApiBody, ApiParam, ApiOperation, ApiQuery, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { Api } from 'src/common/api';
import { UserPackagesService } from './userPackages.service';
import { UserPackages, UserPackageStatus } from './entities/userPackages.entity';
import { UserPackageStatusDto } from './dto/UserPackageStatusDto';
import { PurchasePackageDto } from './dto/PurchasePackageDto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { IsUUID } from 'class-validator';

@ApiTags("Order")
@Controller(Api.userPackages)  // Định tuyến API dưới /fetal-records
@ApiBearerAuth()
export class UserPackagesController {
  constructor(private readonly userPackagesService: UserPackagesService) { }

  // API để mua gói dịch vụ cho thai nhi
  @Post()
  @ApiBody({ description: 'Mua một gói dịch vụ cho người dùng với thông tin userId và packageId', type: PurchasePackageDto })
  async purchasePackage(
    @Body() purchasePackageDto: PurchasePackageDto
  ) {
    return await this.userPackagesService.purchasePackage(purchasePackageDto.userId, purchasePackageDto.packageId);
  }

  // API để lấy tất cả các gói dịch vụ của thai nhi
  //   @Get(':fetalRecordId')
  //   async getUserPackagesForFetalRecord(
  //     @Param('fetalRecordId') fetalRecordId: string,
  //   ): Promise<UserPackages[]> {
  //     return await this.userPackagesService.getUserPackagesForFetalRecord(fetalRecordId);
  //   }

  // API để lấy tất cả các gói dịch vụ của một user (mẹ bầu)
  @Get('user/:userId')
  async getUserPackagesByUser(
    @Param('userId') userId: string,
  ): Promise<UserPackages[]> {
    return await this.userPackagesService.getUserPackagesByUser(userId);
  }


  // API để lấy các gói dịch vụ theo trạng thái
  @Get('status/:status')
  @ApiParam({
    name: 'status',
    description: 'Trạng thái của gói dịch vụ',
    enum: UserPackageStatus, // Đây là enum bạn muốn sử dụng
  })
  async getUserPackagesByStatus(
    @Param('status') status: UserPackageStatus,
  ): Promise<UserPackages[]> {
    return await this.userPackagesService.getUserPackagesByStatus(status);
  }

  // API để thay đổi trạng thái của gói dịch vụ

  @ApiBody({ type: UserPackageStatusDto })
  @Put(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() newStatus: UserPackageStatusDto,
  ) {
    return await this.userPackagesService.changeStatus(id, newStatus.status);
  }



  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của người dùng' })
  @ApiQuery({ name: 'status', required: false, example: 'PAID', description: 'Lọc theo trạng thái đơn hàng' })
  @ApiQuery({ name: 'packageName', required: false, example: 'Gói VIP', description: 'Tìm kiếm theo tên gói' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Số trang (pagination)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi trên mỗi trang' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng', type: Pagination })
  async getAllUserPackages(
    @Query('status') status?: string,
    @Query('packageName') packageName?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<UserPackages>> {
    const options = { page: Number(page), limit: Number(limit) };
    return this.userPackagesService.getAllUserPackages(status, packageName, options);
  }

  @Post(':id/upgrade')
  async upgradePackage(
    @Req() req: Request,
    @Param('id') userPackageId: string,
    @Body() upgradePackageDto: { newPackageId: string },
  ) {
    const userId = (req as any).user.id;
    return await this.userPackagesService.upgradePackage(userId, userPackageId, upgradePackageDto.newPackageId);
  }
}
