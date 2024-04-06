import { Module } from '@nestjs/common';
import { SubSkillsService } from './sub_skills.service';
import { SubSkillsController } from './sub_skills.controller';

@Module({
  controllers: [SubSkillsController],
  providers: [SubSkillsService]
})
export class SubSkillsModule {}
