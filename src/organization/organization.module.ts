import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { CommonFunctionsService } from 'src/services/commonService';
import { EventService } from 'src/Events/event.service';
import { S3BucketService } from 'src/services/s3_bucket_service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService,  CommonFunctionsService, S3BucketService,EventService],
  imports: []
})
export class OrganizationModule {}
