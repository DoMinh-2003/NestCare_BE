import { IsDate, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class UpdateServiceDto {
    constructor(
        name: string,
        description: string = '',
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
        isDeleted: number = 0,
        price: number = 0,
    ) {
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
        this.price = price;
    }

    @IsNotEmpty()
    @IsString()
    public name: string;
    
    @IsNumber()
    public price: number;

    public description: string;

    @IsDate()
    public createdAt: Date;

    @IsDate()
    public updatedAt: Date;

    @IsInt()
    public isDeleted: number;
}
