import { IsDate, IsInt, IsNotEmpty } from 'class-validator';

export default class CreateCategoryDto {
    constructor(
        name: string,
        description: string = '',
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
        isDeleted: number = 0,
    ) {
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
    }

    @IsNotEmpty()
    public name: string;

    public description: string;

    @IsDate()
    public createdAt: Date;

    @IsDate()
    public updatedAt: Date;

    @IsInt()
    public isDeleted: number;
}
