import { IsBoolean, IsString } from 'class-validator';

export default class SearchMedicationsDto {
  constructor(keyword: string = '', isDeleted: boolean = false) {
    this.keyword = keyword;
    this.isDeleted = isDeleted;
  }

  @IsString()
  public keyword: string;

  @IsBoolean()
  public isDeleted: boolean;
}
