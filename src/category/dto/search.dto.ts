import { IsNumber, IsString } from 'class-validator';

export default class SearchCategoryDto {
  constructor(keyword: string = '', isDeleted: number = 0) {
    this.keyword = keyword;
    this.isDeleted = isDeleted;
  }

  @IsString()
  public keyword: string;

  @IsNumber()
  public isDeleted: number;
}
