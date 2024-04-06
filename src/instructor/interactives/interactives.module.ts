import { Inject, Module } from "@nestjs/common";
import { InteractivesService } from "./interactives.service";
import { InteractivesController } from "./interactives.controller";
import { QuestionsModule } from "./questions/questions.module";
import { CommonFunctionsService } from "src/services/commonService";
import { QuizModule } from './quiz/quiz.module';
import { QuestModule } from './quest/quest.module';
import { AssignmentModule } from './assignment/assignment.module';
import { NewQuestionModule } from './new-question/new-question.module';

@Module({
  controllers: [InteractivesController],
  providers: [InteractivesService, CommonFunctionsService],
  imports: [QuestionsModule, QuizModule, QuestModule, AssignmentModule, NewQuestionModule],
})
export class InteractivesModule {}
