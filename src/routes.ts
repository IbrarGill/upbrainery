import { Routes } from "nest-router";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { AdminModule } from "./admin/admin.module";
import { GradeModule } from "./admin/grade/grade.module";
import { ParentsModule } from "./parents/parents.module";
import { LearnerModule } from "./learner/learner.module";
import { ChatBotModule } from "./chat-bot/chat-bot.module";
import { SkillsModule } from "./admin/skills/skills.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { SmartdeskModule } from "./smartdesk/smartdesk.module";
import { BadgesModule } from "./instructor/badges/badges.module";
import { SharedApiModule } from "./shared-api/shared-api.module";
import { InstructorModule } from "./instructor/instructor.module";
import { SubjectsModule } from "./admin/subjects/subjects.module";
import { PollingModule } from "./smartdesk/polling/polling.module";
import { ClustersModule } from "./learner/clusters/clusters.module";
import { PathwaysModule } from "./learner/pathways/pathways.module";
import { StandardsModule } from "./admin/standards/standards.module";
import { SubSkillsModule } from "./admin/sub_skills/sub_skills.module";
import { ContentsModule } from "./instructor/contents/contents.module";
import { OrganizationModule } from "./organization/organization.module";
import { ExpierenceModule } from "./admin/expierence/expierence.module";
import { QuizModule } from "./instructor/interactives/quiz/quiz.module";
import { ClassTypesModule } from "./admin/class_types/class_types.module";
import { CourseModule } from "./instructor/contents/course/course.module";
import { GradebookModule } from "./instructor/gradebook/gradebook.module";
import { QuestModule } from "./instructor/interactives/quest/quest.module";
import { AccountTypeModule } from "./admin/account_type/account_type.module";
import { SessionModule } from "./instructor/contents/session/session.module";
import { SessionTypeModule } from "./admin/session_type/session_type.module";
import { ContentTypeModule } from "./admin/content-type/content-type.module";
import { WorkingTypesModule } from "./admin/working_types/working_types.module";
import { ActivityModule } from "./instructor/contents/activity/activity.module";
import { InteractivesModule } from "./instructor/interactives/interactives.module";
import { StandardTypesModule } from "./admin/standard_types/standard_types.module";
import { SmartdeskTypeModule } from "./admin/smartdesk-type/smartdesk-type.module";
import { ExpertyLevelsModule } from "./admin/experty_levels/experty_levels.module";
import { AvailabilitiesModule } from "./admin/availabilities/availabilities.module";
import { StandardLevelsModule } from "./admin/standard_levels/standard_levels.module";
import { TeachingStylesModule } from "./admin/teaching_styles/teaching_styles.module";
import { QuestionsModule } from "./instructor/interactives/questions/questions.module";
import { QuizSubmissionModule } from "./learner/quiz-submission/quiz-submission.module";
import { AssignmentModule } from "./instructor/interactives/assignment/assignment.module";
import { QuestSubmissionModule } from "./learner/quest-submission/quest-submission.module";
import { StandardSubjectsModule } from "./admin/standard_subjects/standard_subjects.module";
import { InteractiveTypesModule } from "./admin/interactive-types/interactive-types.module";
import { NewQuestionModule } from "./instructor/interactives/new-question/new-question.module";
import { SubjectDisciplinesModule } from "./admin/subject_disciplines/subject_disciplines.module";
import { ModuleSegmentTypesModule } from "./admin/module_segment_types/module_segment_types.module";
import { AssignmentSubmissionModule } from "./learner/assignment-submission/assignment-submission.module";
import { CertificationsLevelsModule } from "./learner/certifications-levels/certifications-levels.module";
import { ActivitiesSubmissionModule } from "./learner/activities-submission/activities-submission.module";
import { ModuleSegmentDeliveriesModule } from "./admin/module_segment_deliveries/module_segment_deliveries.module";


export const routes: Routes = [
  {
    path: "auth",
    module: AuthModule,
  },
  {
    path: "user",
    module: UserModule,
  },
  {
    path: "smartdesk",
    module: SmartdeskModule,
    children: [
      {
        path: "polling",
        module: PollingModule,
      },
    ],
  },
  {
    path: "schedule",
    module: ScheduleModule,
  },
  {
    path: "admin",
    module: AdminModule,
    children: [
      {
        path: "account-type",
        module: AccountTypeModule,
      },
      {
        path: "subject",
        module: SubjectsModule,
      },
      {
        path: "grade",
        module: GradeModule,
      },
      {
        path: "expierence",
        module: ExpierenceModule,
      },
      {
        path: "availabilities",
        module: AvailabilitiesModule,
      },
      {
        path: "classtypes",
        module: ClassTypesModule,
      },
      {
        path: "expertylevels",
        module: ExpertyLevelsModule,
      },
      {
        path: "sessiontype",
        module: SessionTypeModule,
      },
      {
        path: "skills",
        module: SkillsModule,
      },
      {
        path: "standardlevels",
        module: StandardLevelsModule,
      },
      {
        path: "standardsubjects",
        module: StandardSubjectsModule,
      },
      {
        path: "standardtypes",
        module: StandardTypesModule,
      },
      {
        path: "standards",
        module: StandardsModule,
      },
      {
        path: "subskills",
        module: SubSkillsModule,
      },
      {
        path: "subjectdisciplines",
        module: SubjectDisciplinesModule,
      },
      {
        path: "teachingstyles",
        module: TeachingStylesModule,
      },
      {
        path: "workingtypes",
        module: WorkingTypesModule,
      },
      {
        path: "interactiveTypes",
        module: InteractiveTypesModule,
      },
      {
        path: "contentType",
        module: ContentTypeModule,
      },
      {
        path: "module-segment-type",
        module: ModuleSegmentDeliveriesModule,
      },
      {
        path: "module-segment-delivery",
        module: ModuleSegmentTypesModule,
      },
      {
        path: "smartdesk-type",
        module: SmartdeskTypeModule,
      },
    ],
  },
  {
    path: "learner",
    module: LearnerModule,
    childrens: [
      {
        path: 'activitiessubmission',
        module: ActivitiesSubmissionModule
      },
      {
        path: "quizsubmission",
        module: QuizSubmissionModule,
      },
      {
        path: "questsubmission",
        module: QuestSubmissionModule,
      },
      {
        path: "assignmentsubmission",
        module: AssignmentSubmissionModule,
      },
      {
        path: "clusters",
        module: ClustersModule,
      },
      {
        path: "pathways",
        module: PathwaysModule,
      },
      {
        path: "certification-levels",
        module: CertificationsLevelsModule,
      },
    ],
  },
  {
    path: "organization",
    module: OrganizationModule,
  },
  {
    path: "parent",
    module: ParentsModule,
  },
  {
    path: "chatbot",
    module: ChatBotModule,
  },
  {
    path: "instructor",
    module: InstructorModule,
    children: [
      {
        path: "badges",
        module: BadgesModule,
      },
      {
        path: "interactives",
        module: InteractivesModule,
        children: [
          {
            path: 'quiz',
            module: QuizModule
          },
          {
            path: 'quest',
            module: QuestModule
          },
          {
            path: 'assignment',
            module: AssignmentModule
          },
          {
            path: "questions",
            module: QuestionsModule,
          },
          {
            path: "new-questions",
            module: NewQuestionModule,
          },
        ],
      },
      {
        path: "gradebook",
        module: GradebookModule,
      },
      {
        path: "contents",
        module: ContentsModule,
        children: [
          {
            path: "activity",
            module: ActivityModule,
          },
          {
            path: "course",
            module: CourseModule,
          },
          {
            path: "seesion",
            module: SessionModule,
          },
        ],
      },
    ],
  },
  {
    path: "schedule",
    module: ScheduleModule,
  },

  {
    path: "common",
    module: SharedApiModule,
  },
];
