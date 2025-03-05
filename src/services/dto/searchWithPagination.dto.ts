import { Type } from 'class-transformer';
import {
  PaginationRequestModel,
  SearchPaginationRequestModel,
} from 'src/common/models';
import SearchServicesDto from './search.dto';
import { ApiProperty } from '@nestjs/swagger';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchServicesDto> {
  constructor(
    pageInfo: PaginationRequestModel,
    searchCondition: SearchServicesDto,
  ) {
    super(pageInfo, searchCondition);
  }

  @ApiProperty({
    description: 'Pagination information for the search',
    type: PaginationRequestModel,
  })
  @Type(() => PaginationRequestModel)
  public pageInfo!: PaginationRequestModel;

  @ApiProperty({
    description: 'Search condition for the services',
    type: SearchServicesDto,
  })
  @Type(() => SearchServicesDto)
  public searchCondition!: SearchServicesDto;
}
