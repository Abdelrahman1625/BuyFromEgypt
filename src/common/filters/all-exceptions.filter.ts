import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'A database error occurred';

    // Handle known Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          const target = (exception.meta?.target as string[])?.join(', ');
          errorMessage = `Duplicate entry: ${target}`;
          httpStatus = HttpStatus.CONFLICT;
          break;
        case 'P2003':
          errorMessage = 'Foreign key constraint failed';
          httpStatus = HttpStatus.BAD_REQUEST;
          break;
        case 'P2025':
          errorMessage = 'Record not found';
          httpStatus = HttpStatus.NOT_FOUND;
          break;
        default:
          errorMessage = `Database error: ${exception.message}`;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      errorMessage = 'Invalid database query';
      httpStatus = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      errorMessage = 'Unknown database error';
    }

    const responseBody = {
      statusCode: httpStatus,
      message: errorMessage,
      error: 'Database Prisma Error',
      // timestamp: new Date().toISOString(),
      // path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}


// import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
// import { HttpAdapterHost } from '@nestjs/core';
// import { Prisma } from '@prisma/client';
//
// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   private readonly logger = new Logger(AllExceptionsFilter.name);
//
//   constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
//
//   catch(exception: unknown, host: ArgumentsHost): void {
//     const { httpAdapter } = this.httpAdapterHost;
//     const ctx = host.switchToHttp();
//
//     let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
//     let errorMessage = 'An unexpected error occurred';
//     let errorDetails: any = null;
//
//     if (exception instanceof HttpException) {
//       httpStatus = exception.getStatus();
//       errorMessage = exception.message || 'An error occurred';
//       errorDetails = exception.getResponse();
//     } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
//       httpStatus = HttpStatus.BAD_REQUEST;
//       switch (exception.code) {
//         case 'P2002':
//           const target = (exception.meta?.target as string[])?.join(', ');
//           errorMessage = `Duplicate entry: ${target}`;
//           httpStatus = HttpStatus.CONFLICT;
//           break;
//         case 'P2003':
//           errorMessage = 'Foreign key constraint failed';
//           break;
//         case 'P2025':
//           errorMessage = 'Record not found';
//           httpStatus = HttpStatus.NOT_FOUND;
//           break;
//         default:
//           errorMessage = `Database error: ${exception.message}`;
//       }
//     } else if (exception instanceof Error) {
//       errorMessage = exception.message;
//     }
//
//     this.logger.error(`Error: ${errorMessage}`, exception instanceof Error ? exception.stack : '');
//
//     const responseBody = {
//       statusCode: httpStatus,
//       message: errorMessage,
//       timestamp: new Date().toISOString(),
//       path: httpAdapter.getRequestUrl(ctx.getRequest()),
//     };
//
//     httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
//   }
// }