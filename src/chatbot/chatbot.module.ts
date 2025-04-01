import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { WeekCheckupServiceEntity } from 'src/weekCheckupService/entities/WeekCheckupService.entity';
import { Packages } from 'src/packages/entity/package.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Packages,WeekCheckupServiceEntity])],
  providers: [ChatbotService],
  controllers: [ChatbotController],
//   exports: [
//     CategoryService,
//   ],
})
export class ChatbotModule { }

