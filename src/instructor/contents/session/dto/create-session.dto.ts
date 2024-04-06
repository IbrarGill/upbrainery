import { Optional } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MIN,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { isBoolean } from "lodash";

export const _modulelist = [
  {
    moduleId: 7,
    startDate: "2023-05-12T09:27:55.000Z",
    endDate: "2023-05-12T09:27:55.000Z",
    classtypeId: 1,
  },
  {
    moduleId: 8,
    startDate: "2023-05-12T09:27:55.000Z",
    endDate: "2023-05-12T09:27:55.000Z",
    classtypeId: 1,
  },
];





export const _learnerList = [
  {
    leanerId: 6,
  },
  {
    leanerId: 11,
  },
  {
    leanerId: 13,
  },
];

export const _instructorList = [
  {
    instructorId: 2,
  },
];



export class ModuleSedmentlist {
  @ApiProperty()
  moduleId: number;
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  endDate: string;
  @ApiProperty()
  classtypeId: number;
}
export const _interactiveQuestlist = [
  {
    content_interactive_segments_id: 15,
    interactiveId: 1,
    startDate: "2023-05-12T09:27:55.000Z",
    endDate: "2023-05-12T09:27:55.000Z",
    is_assesment: true,
    assessmentPoint: 2,
  }
];

export class QuestSegmentList {
  @ApiProperty()
  content_interactive_segments_id: number;
  @ApiProperty()
  interactiveId: number;
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  endDate: string;
  @ApiProperty()
  is_assesment: boolean;
  @ApiProperty()
  assessmentPoint: number;
}
export const _interactivAssignmentlist = [
  {
    content_interactive_segments_id: 14,
    interactiveId: 3,
    startDate: "2023-05-12T09:27:55.000Z",
    endDate: "2023-05-12T09:27:55.000Z",
    is_assesment: true,
    assessmentPoint: 2,
  },
];
export class AssignmentSegmentList {
  @ApiProperty()
  content_interactive_segments_id: number;
  @ApiProperty()
  interactiveId: number;
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  endDate: string;
  @ApiProperty()
  is_assesment: boolean;
  @ApiProperty()
  assessmentPoint: number;
}

export const _quizlist = [
  {
    content_interactive_segments_id: 13,
    interactiveId: 2,
    startDate: "2023-05-12T09:27:55.000Z",
    endDate: "2023-05-12T09:27:55.000Z",
    graded: false,
    offline: false,
  },
];

export class QuizSegmentList {
  @ApiProperty()
  content_interactive_segments_id: number;
  @ApiProperty()
  interactiveId: number;
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  endDate: string;
  @ApiProperty()
  graded: boolean;
  @ApiProperty()
  offline: boolean;
}

export class LearnerList {
  @ApiProperty()
  leanerId: number;
}

export class InstructorList {
  @ApiProperty()
  instructorId: number;
}

export class CourseSegment {
  @ApiProperty({ example: _modulelist })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => ModuleSedmentlist)
  modulelist: ModuleSedmentlist[];

  @ApiProperty({ example: _interactiveQuestlist })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => QuestSegmentList)
  questSegmentList: QuestSegmentList[];

  @ApiProperty({ example: _interactivAssignmentlist })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => AssignmentSegmentList)
  assignmentSegmentList: AssignmentSegmentList[];

  @ApiProperty({ example: _quizlist })
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => QuizSegmentList)
  quizSegmentList: QuizSegmentList[];
}



export class CreateSessionDto {
  @ApiProperty({
    type: "array",
    name: "sessionPhoto",
    description: "user can upload his session picture",
    items: { type: "string", format: "binary" },
  })
  sessionPhoto: any;

  @ApiProperty({ example: 1 })
  @IsNumber()
  instructor_id: number;

  @ApiProperty({ example: "test session" })
  @IsString()
  sessionName: string;

  @ApiProperty({ example: "session description" })
  @IsString()
  sessionDescription: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  sessionAvailabilityId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  sessionWorkTypeId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  sessionTypeId: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  startAge: number;

  @ApiProperty({ example: 14 })
  @IsNumber()
  endAge: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  startGrade: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  endGrade: number;

  @ApiProperty({ example: "2023-04-22T00:00:00.000Z" })
  @IsString()
  startDate: string;

  @ApiProperty({ example: "2023-04-22T00:00:00.000Z" })
  @IsString()
  endDate: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(99)
  price: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  availableToPurchase: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  is_published: boolean;

  @ApiPropertyOptional({
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  pd_session: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  course_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  isDraft: number;

  @ApiProperty({ example: _learnerList })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => LearnerList)
  learnerList: LearnerList[];

  @ApiProperty({ example: _instructorList })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => InstructorList)
  instructorList: InstructorList[];

  @ApiProperty()
  @Transform(({ value }) => JSON.parse(value))
  courseSegment: CourseSegment;
}

enum orderByList {
  LatestSession = "Latest Session",
  OldestSession = "Oldest Session",
  SortByAZ = "Sort By A-Z",
  SortByZA = "Sort By Z-A",
}

enum SessionCreation {
  AssignedtoMe = "Assigned to Me",
  CreatedbyMe = "Created by Me"
}

enum StatusList {
  Active = "Active",
  Draft = "Draft",
}
export class SearchSessionsBySkills {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sub_skill_name: string;
}

export class SearchContentSession {
  @ApiProperty({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiProperty({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({ description: "Current UserId" })
  @IsOptional()
  @IsNumber()
  instuctorId: number;

  @ApiPropertyOptional({ description: "Professional Development Session" })
  @IsOptional()
  @IsNumber()
  is_pd_session: number;

  @ApiPropertyOptional({ description: "session type id" })
  @IsOptional()
  @IsNumber()
  session_type_id: number;

  @ApiPropertyOptional({ description: "start Grade" })
  @IsOptional()
  @IsNumber()
  startGrade: number;

  @ApiPropertyOptional({
    description: "end Grade",
  })
  @IsOptional()
  @IsNumber()
  endGrade: number;

  @ApiPropertyOptional({ description: "Lower Price" })
  @IsOptional()
  @IsNumber()
  startPrice: number;

  @ApiPropertyOptional({
    description: "Top Price",
  })
  @IsOptional()
  @IsNumber()
  endprice: number;

  @ApiPropertyOptional({
    description: "start Date",
    example: "2023-04-22T00:00:00.000Z",
  })
  @IsOptional()
  @IsString()
  startDate: string;

  @ApiPropertyOptional({
    description: "end Date",
    example: "2023-04-22T00:00:00.000Z",
  })
  @IsOptional()
  @IsString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjects: string;

  @ApiPropertyOptional({
    enum: ["Active", "Draft"],
  })
  @IsOptional()
  @IsEnum(StatusList)
  status: StatusList;

  @ApiPropertyOptional({
    enum: [
      "Assigned to Me",
      "Created by Me"
    ],
  })
  @IsOptional()
  @IsEnum(SessionCreation)
  sessions: SessionCreation;

  @ApiPropertyOptional({
    example: "Latest Session",
    enum: [
      "Latest Session",
      "Oldest Session",
      "Sort By A-Z",
      "Sort By Z-A",
    ],
  })
  @IsEnum(orderByList)
  orderBy: orderByList;


}

export class learnerSessionQuery {
  @ApiProperty({
    required: true,
    default: 0,
    description: "Page number",
  })
  @IsNumber()
  pageNo: number;
  @ApiProperty({
    required: true,
    default: 10,
    description: "limit number",
  })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({ description: "leaner Id" })
  @IsOptional()
  @IsNumber()
  learnerId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchByText: string;

  @ApiPropertyOptional({
    example: "Latest Session",
    enum: [
      "Latest Session",
      "Oldest Session",
      "Sort By Title ASC",
      "Sort By Title DESC",
    ],
  })
  @IsEnum(orderByList)
  @IsOptional()
  orderBy: orderByList;

  @ApiPropertyOptional({ description: 'Send Either 0 | 1' })
  @IsOptional()
  @IsNumber()
  quest: number
}


export class ShareableLinkQueryDto {
  @ApiPropertyOptional()
  token: string
  @ApiPropertyOptional()
  userId: number
}

export class UpComingSessionQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  organization_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  instructor_id: number;
}

export class SessionDuplicationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  createrID: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sessionName: string;
}