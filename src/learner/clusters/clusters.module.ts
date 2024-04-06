import { Module } from "@nestjs/common";
import { ClustersService } from "./clusters.service";
import { ClustersController } from "./clusters.controller";
import { CommonFunctionsService } from "src/services/commonService";

@Module({
  controllers: [ClustersController],
  providers: [ClustersService, CommonFunctionsService],
})
export class ClustersModule {}
