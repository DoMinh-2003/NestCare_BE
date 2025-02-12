import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { Api } from 'src/common/api';
import { SearchWithPaginationDto } from './dto';
import { SearchPaginationResponseModel } from 'src/common/models';
import { formatResponse } from 'src/utils';

@ApiTags('Categories')
@Controller(Api.category)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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
