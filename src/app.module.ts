import { join } from "path";
import { routes } from "./routes";
import { AppService } from "./app.service";
import { RouterModule } from "nest-router";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { AdminModule } from "./admin/admin.module";
import { PrismaModule } from "./prisma/prisma.module";
import { MulterModule } from "@nestjs/platform-express";
import { EmailModule } from "./EmailService/EmailModule";
import { ParentsModule } from "./parents/parents.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ChatBotModule } from "./chat-bot/chat-bot.module";
import { S3BucketService } from "./services/s3_bucket_service";
import { SharedApiModule } from "./shared-api/shared-api.module";
import { LoggerMiddleware } from "./Middlewares/loggerMiddleware";
import { InstructorModule } from "./instructor/instructor.module";
import { OrganizationModule } from "./organization/organization.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AccountTypeModule } from "./admin/account_type/account_type.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SmartdeskModule } from "./smartdesk/smartdesk.module";
import { SocketIoModule } from "./socket_io/socket_io.module";
import { LearnerModule } from "./learner/learner.module";
import { EventModule } from "./Events/event.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { OnnetModule } from "./onnet/onnet.module";
import { CommonModule } from "./common/common.module";
import { CertificationsLevelsModule } from "./learner/certifications-levels/certifications-levels.module";
import { XssProtectionMiddleware } from "./Middlewares/xss-protection.middleware.ts";
import { DecryptAuthToken } from "./Middlewares/decryptAuthToken";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./authStrategy/roleGuard/roleGaurd";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ParentsModule,
    OrganizationModule,
    RouterModule.forRoutes(routes),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../"),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: "./public",
    }),
    EventEmitterModule.forRoot(),
    SharedApiModule,
    AuthModule,
    AccountTypeModule,
    AdminModule,
    ChatBotModule,
    InstructorModule,
    SmartdeskModule,
    SocketIoModule,
    LearnerModule,
    ScheduleModule,
    OnnetModule,
    CommonModule,
    CertificationsLevelsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailModule, S3BucketService, EventModule, {
    provide: APP_GUARD,
    useClass: RolesGuard,
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DecryptAuthToken, LoggerMiddleware, XssProtectionMiddleware).forRoutes("*");
  }
}
