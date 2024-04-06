import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";


const { format } = require("winston");
const winston = require("winston");

const logConfiguration = {
  transports: [
    new winston.transports.File({
      filename: "src/utils/server.log",
    }),
  ],

  format: winston.format.combine(
    winston.format.label({
      label: `Label🏷️`,
    }),
    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    format.json(),
    winston.format.printf(
      (info) =>
        `{"time":"${info.timestamp}",${info.level}:${info.label},"Message":"${info.message}"}`
    )
  ),
};

const fileLogger = winston.createLogger(logConfiguration);

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");
  SocketsGateway: any;

  use(request: Request, response: Response, next: NextFunction): void {

    const { ip, method, originalUrl } = request;
    const userAgent = request.get("user-agent") || "";

    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
      );

      fileLogger.info(
        `${method}${originalUrl}${statusCode}${contentLength}-${userAgent}${ip}`
      );

      // let date = new Date();

      // if (SocketsGateway.socket) {
      //   SocketsGateway.socket.emit(
      //     "logs",
      //     `Time:${
      //       date.toDateString() + " " + date.toTimeString()
      //     },Origin:${method}${originalUrl}${statusCode}${contentLength}-${userAgent}${ip}`.toString()
      //   );
      // }
    });

    next();
  }
}
