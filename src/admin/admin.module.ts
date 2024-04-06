import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { SubjectsModule } from "./subjects/subjects.module";
import { GradeModule } from "./grade/grade.module";
import { ExpierenceModule } from "./expierence/expierence.module";
import { AccountTypeModule } from "./account_type/account_type.module";
import { SkillsModule } from "./skills/skills.module";
import { SubSkillsModule } from "./sub_skills/sub_skills.module";
import { SubjectDisciplinesModule } from "./subject_disciplines/subject_disciplines.module";
import { TeachingStylesModule } from "./teaching_styles/teaching_styles.module";
import { ExpertyLevelsModule } from "./experty_levels/experty_levels.module";
import { StandardTypesModule } from "./standard_types/standard_types.module";
import { StandardSubjectsModule } from "./standard_subjects/standard_subjects.module";
import { StandardLevelsModule } from "./standard_levels/standard_levels.module";
import { StandardsModule } from "./standards/standards.module";
import { ClassTypesModule } from "./class_types/class_types.module";
import { SessionTypeModule } from "./session_type/session_type.module";
import { WorkingTypesModule } from "./working_types/working_types.module";
import { AvailabilitiesModule } from "./availabilities/availabilities.module";
import { InteractiveTypesModule } from "./interactive-types/interactive-types.module";
import { ModuleSegmentTypesModule } from './module_segment_types/module_segment_types.module';
import { ModuleSegmentDeliveriesModule } from './module_segment_deliveries/module_segment_deliveries.module';
import { SmartdeskTypeModule } from './smartdesk-type/smartdesk-type.module';
import { ContentTypeModule } from './content-type/content-type.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    SubjectsModule,
    GradeModule,
    ExpierenceModule,
    AccountTypeModule,
    SkillsModule,
    SubSkillsModule,
    SubjectDisciplinesModule,
    TeachingStylesModule,
    ExpertyLevelsModule,
    StandardTypesModule,
    StandardSubjectsModule,
    StandardLevelsModule,
    StandardsModule,
    ClassTypesModule,
    SessionTypeModule,
    WorkingTypesModule,
    AvailabilitiesModule,
    InteractiveTypesModule,
    ModuleSegmentTypesModule,
    ModuleSegmentDeliveriesModule,
    SmartdeskTypeModule,
    ContentTypeModule,
  ],
})
export class AdminModule {}
