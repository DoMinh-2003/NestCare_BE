import { Type } from 'class-transformer';
import {
  PaginationRequestModel,
  SearchPaginationRequestModel,
} from 'src/common/models';
import SearchPackagesDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchPackagesDto> {
  constructor(
    pageInfo: PaginationRequestModel,
    searchCondition: SearchPackagesDto,
  ) {
    super(pageInfo, searchCondition);
  }

  @Type(() => SearchPackagesDto)
  public searchCondition!: SearchPackagesDto;
}
