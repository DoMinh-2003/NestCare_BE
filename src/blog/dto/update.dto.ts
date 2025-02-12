import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateBlogDto {
    constructor(
        userId: string,
        title: string,
        description: string,
        content: string,
    ) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.content = content;
    }

    @IsNotEmpty()
    @IsString()
    public userId: string;

    @IsNotEmpty()
    @IsString()
    public title: string;

    @IsNotEmpty()
    @IsString()
    public category_id: string;

    @IsNotEmpty()
    @IsString()
    public image_url: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsNotEmpty()
    @IsString()
    public content: string;
}
