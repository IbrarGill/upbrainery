import { Module } from "@nestjs/common";
import { CertificationsLevelsService } from "./certifications-levels.service";
import { CertificationsLevelsController } from "./certifications-levels.controller";

@Module({
  controllers: [CertificationsLevelsController],
  providers: [CertificationsLevelsService],
})
export class CertificationsLevelsModule {}
