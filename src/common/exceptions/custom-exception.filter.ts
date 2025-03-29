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
        success: false,
        message: exception.message,
        errors: exception.errors || [],
      });
    }
    else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        success: false,
        message: exception.message,
        errors: [],
      });
    }
    else {
      // Lỗi không xác định, mặc định 500
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          exception instanceof Error
            ? exception.message
            : 'An unknown error occurred',
        errors: [],
      });
    }
  }
}
