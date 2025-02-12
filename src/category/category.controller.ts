import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Request } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { Api } from 'src/common/api';
import { CreateCategoryDto, SearchWithPaginationDto } from './dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatResponse } from 'src/utils';

@ApiTags('Categories')
@Controller(Api.category)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth()
    @Public()
    @Post('create')
    async createCategory(@Body() model: CreateCategoryDto, @Request() req) {
      const category = await this.categoryService.createCategory(model, req.user);
      return formatResponse<Category>(category);
    }
  @Public()
    @HttpCode(HttpStatus.OK)
    @Post('search')
    async getCategories(@Body() model: SearchWithPaginationDto) {
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
}
