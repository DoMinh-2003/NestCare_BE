import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SlotService } from './slot.service';
import { CreateSlotDto } from './dto/CreateSlotDto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Public } from 'src/auth/decorators/public.decorator';


@ApiTags('Slots')
@Controller('api/slots')
@ApiBearerAuth()
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post()
  @ApiOperation({ summary: 'Generate or update slots (Admin only)' })
  @ApiBody({ type: CreateSlotDto })
  async generateSlots(@Body() createSlotDto: CreateSlotDto) {
    return this.slotService.createOrUpdateSlots(
      createSlotDto.startTime,
      createSlotDto.endTime,
      createSlotDto.duration,
    );
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active slots' })
  async getAllSlots() {
    return this.slotService.getAllSlots();
  }

  // @Get('available')
  // @ApiOperation({ summary: 'Get available active slots for a specific date and doctor' })
  // async getAvailableSlots(@Query() availableSlotsDto: AvailableSlotsDto) {
  //   return this.slotService.getAvailableSlots(
  //     new Date(availableSlotsDto.date),
  //     availableSlotsDto.doctorId,
  //   );
  // }

  @Put(':id')
  @ApiOperation({ summary: 'Update a slot (Admin only)' })
  async updateSlot(@Param('id') id: string, @Body() updateSlotDto: UpdateSlotDto) {
    return this.slotService.updateSlot(id, updateSlotDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a slot (Admin only)' })
  async deleteSlot(@Param('id') id: string) {
    return this.slotService.deleteSlot(id);
  }
}