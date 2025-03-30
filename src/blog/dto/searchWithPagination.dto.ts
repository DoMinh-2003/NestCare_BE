import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import SearchBlogDto from './search.dto';
import { PaginationRequestModel } from 'src/common/models';

export default class SearchWithPaginationDto {
  @ApiProperty({ type: PaginationRequestModel })
  @ValidateNested()
  @Type(() => PaginationRequestModel)
  pageInfo: PaginationRequestModel;

  @ApiPropertyOptional({ type: SearchBlogDto })
  @ValidateNested()
  @Type(() => SearchBlogDto)
  searchCondition?: SearchBlogDto = new SearchBlogDto();

}
