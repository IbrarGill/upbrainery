import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtService } from "@nestjs/jwt";
import { JwtStrategy, RefreshTokenStrategy } from "src/authStrategy/strategy";
import { SendgridService } from "src/EmailService/emailservice";
import { S3BucketService } from "src/services/s3_bucket_service";
import { EmailBodyService } from "src/EmailService/emailBodyService";
import { EventService } from "src/Events/event.service";
import { CommonFunctionsService } from "src/services/commonService";
import { GoogleStrategy } from "src/authStrategy/googleStrategy";
import { ForgetPasswordStrategy } from "src/authStrategy/forgetpasswordstrategy/forgetpasswordstrategy";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    RefreshTokenStrategy,
    ForgetPasswordStrategy,
    SendgridService,
    S3BucketService,
    EmailBodyService,
    EventService,
    CommonFunctionsService,
    GoogleStrategy
  ],
})
export class AuthModule  {}
