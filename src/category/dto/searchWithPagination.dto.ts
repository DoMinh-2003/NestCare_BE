import { Type } from 'class-transformer';
import SearchCategoryDto from './search.dto';
import {
  PaginationRequestModel,
  SearchPaginationRequestModel,
} from 'src/common/models';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchCategoryDto> {
  constructor(
    pageInfo: PaginationRequestModel,
    searchCondition: SearchCategoryDto,
  ) {
    super(pageInfo, searchCondition);
  }

  @Type(() => SearchCategoryDto)
  public searchCondition!: SearchCategoryDto;
}
