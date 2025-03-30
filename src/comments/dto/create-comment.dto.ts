import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({
        description: 'Nội dung của comment',
        example: 'Đây là một comment mẫu',
    })
    content: string;

    @ApiProperty({
        description: 'ID của blog mà comment thuộc về',
        example: '654a2366-5cd3-4ce4-a241-d213d4186af6',
    })
    blogId: string;

    @ApiProperty({
        description: 'ID của người dùng tạo comment',
        example: 'dde53461-99d8-4ab2-b8fd-7c0d39e075be',
    })
    userId: string;

    @ApiProperty({
        description: 'ID của comment cha (nếu có)',
        example: 'ea03ab66-4080-424f-b165-c4ff958d6836',
        required: false, // Đánh dấu là không bắt buộc
    })
    parentId?: string;
}