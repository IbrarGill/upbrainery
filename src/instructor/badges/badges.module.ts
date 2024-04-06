import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { CommonFunctionsService } from 'src/services/commonService';
import { EventService } from 'src/Events/event.service';
import { S3BucketService } from 'src/services/s3_bucket_service';

@Module({
  controllers: [BadgesController,],
  providers: [BadgesService,CommonFunctionsService,S3BucketService,EventService]
})
export class BadgesModule {}
