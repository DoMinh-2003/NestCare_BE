import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import CustomHttpException from './http.exception';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof CustomHttpException) {
      response.status(exception.status).json({
        status: exception.status,
        message: exception.message,
        errors: exception.errors,
      });
    } 
     else {
      // Xử lý lỗi không xác định
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          exception instanceof Error
            ? exception.message
            : 'An unknown error occurred',
      });
    }
  }

}
