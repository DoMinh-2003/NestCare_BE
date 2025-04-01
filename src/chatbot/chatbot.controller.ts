import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dtos/chat-request.dto';
import { ChatResponseDto } from './dtos/chat-response.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('ChatBot')
@Controller('api/chat')
@Public()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @ApiBody({ type: ChatRequestDto })
  async handleMessage(@Body() chatRequestDto: ChatRequestDto) {
    const reply = await this.chatbotService.getChatResponse(chatRequestDto.message);
    return { reply };
  }
}
