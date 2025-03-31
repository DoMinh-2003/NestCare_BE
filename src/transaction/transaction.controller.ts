import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags("Transactions")
@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

//   @Post()
//   async create(@Body() createTransactionDto: CreateTransactionDto){
//     return this.transactionService.create(createTransactionDto);
//   }

  @Get('user/:userId')
  @ApiParam({ name: 'userId', type: 'string', description: 'ID of the user to retrieve transactions for' })
  @ApiOkResponse({ description: 'Successfully retrieved user transactions', type: [Transaction] })
  async findAllByUser(@Param('userId') userId: string) {
    return this.transactionService.findAllByUser(userId);
  }

//   @Get(':id')
//   async findOne(@Param('id') id: string) {
//     return this.transactionService.findOne(id);
//   }

  // Add other controller methods as needed
}