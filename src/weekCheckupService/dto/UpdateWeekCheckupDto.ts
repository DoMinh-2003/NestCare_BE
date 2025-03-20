import { PartialType } from '@nestjs/swagger';
import { CreateWeekCheckupDto } from './CreateWeekCheckupDto';

export class UpdateWeekCheckupDto extends PartialType(CreateWeekCheckupDto) {}
