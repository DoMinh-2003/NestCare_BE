import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
}
