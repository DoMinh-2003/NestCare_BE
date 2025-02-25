import { Type } from 'class-transformer';
import {
  PaginationRequestModel,
  SearchPaginationRequestModel,
} from 'src/common/models';
import SearchServicesDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchServicesDto> {
  constructor(
    pageInfo: PaginationRequestModel,
    searchCondition: SearchServicesDto,
  ) {
    super(pageInfo, searchCondition);
  }

  @Type(() => SearchServicesDto)
  public searchCondition!: SearchServicesDto;
}
