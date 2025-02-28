import { Type } from 'class-transformer';
import {
  PaginationRequestModel,
  SearchPaginationRequestModel,
} from 'src/common/models';
import SearchMedicationsDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchMedicationsDto> {
  constructor(
    pageInfo: PaginationRequestModel,
    searchCondition: SearchMedicationsDto,
  ) {
    super(pageInfo, searchCondition);
  }

  @Type(() => SearchMedicationsDto)
  public searchCondition!: SearchMedicationsDto;
}
