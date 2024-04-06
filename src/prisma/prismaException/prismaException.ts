import { HttpException, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Response } from "express";

export class PrismaException extends Prisma.PrismaClientKnownRequestError {
  findprismaexception(
    error: PrismaClientKnownRequestError | HttpException,
    response: Response
  ) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
  
      if (error.code === "P2025") {
        this.returnResponseOnErrorChecck(
          {
            message: `An operation failed because it depends on one or more records that were required but not found | ${error.meta.cause.toString()}`,
            code: HttpStatus.BAD_REQUEST,
          },
          error,
          response
        );
      } else if (error.code === "P2003") {
        this.returnResponseOnErrorChecck(
          {
            message: `Foreign key constraint failed on the field:${error.meta.field_name.toString()}`,
            code: HttpStatus.BAD_REQUEST,
          },
          error,
          response
        );
      } else if (error.code === "P2002") {
        this.returnResponseOnErrorChecck(
          {
            message: `Unique constraint failed on the :${error.meta.target}`,
            code: HttpStatus.BAD_REQUEST,
          },
          error,
          response
        );
      }
    } else if (error instanceof HttpException) {
      this.returnResponseOnErrorChecck(null, error, response);
    } else {
      this.returnResponseOnErrorChecck(null, error, response);
    }
  }

  returnResponseOnErrorChecck(
    message: { message: string; code: number } | null,
    error: Prisma.PrismaClientKnownRequestError | any,
    response: Response
  ) {
    if (message) {
      return response.status(message.code).json(message);
    } else {
      return response.status(error.status).json({
        message: error.message,
        code: error.status,
      });
    }
  }

  getHttpStatusbyCode(code: number) {
    switch (code) {
      case 200:
        return HttpStatus.OK;
      case 404:
        return HttpStatus.NOT_FOUND;
      case 400:
        return HttpStatus.BAD_REQUEST;
      case 204:
        return HttpStatus.NO_CONTENT;
      case 204:
        return HttpStatus.ACCEPTED;
      case 201:
        return HttpStatus.CREATED;
      case 403:
        return HttpStatus.FORBIDDEN;
      case 401:
        return HttpStatus.UNAUTHORIZED;
      case 302:
        return HttpStatus.FOUND;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
