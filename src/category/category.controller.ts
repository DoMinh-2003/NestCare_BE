import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Request,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { Api } from 'src/common/api';
import {
  CreateCategoryDto,
  SearchCategoryDto,
  SearchWithPaginationDto,
  UpdateCategoryDto,
} from './dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatResponse } from 'src/utils';
import { CustomHttpException } from 'src/common/exceptions';

@ApiTags('Categories')
@Controller(Api.category)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth()
  @Public()
  @ApiBody({ type: CreateCategoryDto })
  @Post('create')
  async createCategory(@Body() model: CreateCategoryDto, @Request() req) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }
    const category = await this.categoryService.createCategory(model, req.user);

    return formatResponse<Category>(category);
  }
  @Public()
  @ApiBody({ type: SearchCategoryDto })
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async getCategories(@Body() model: SearchWithPaginationDto) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'You need to send data',
      );
    }
    const categories: SearchPaginationResponseModel<Category> =
      await this.categoryService.getCategories(model);
    return formatResponse<SearchPaginationResponseModel<Category>>(categories);
  }

  @Public()
  @Get(':id')
  async getCategory(@Param('id') id: string) {
    const category = await this.categoryService.getCategory(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return formatResponse<Category>(category);
  }

  @Public()
  @ApiBearerAuth()
  @ApiBody({ type: UpdateCategoryDto })
  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() model: UpdateCategoryDto,
    @Req() req,
  ) {
    if (!model) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        'You need to send data',
      );
    }
    const category = await this.categoryService.updateCategory(
      id,
      model,
      req.user,
    );
    return formatResponse<Category>(category);
  }

  @Public()
  @ApiBearerAuth()
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const result = await this.categoryService.deleteCategory(id);
    return formatResponse<boolean>(result);
  }
}
