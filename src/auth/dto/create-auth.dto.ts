import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import {
  TutorBio,
  TutorCredentails,
  TutorExpierence,
  TutorTeachingStyle,
} from "src/constant/constant";

export class AuthloginDto {
  @ApiProperty({ example: 'IbrarDev1998' })
  @IsString()
  @IsNotEmpty()
  usernameOremail: string;

  @ApiProperty({ example: 'Happy4You&' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthRegisterParentDto {

  @ApiProperty({
    type: "array",
    name: "avator",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  avator: any;

  @ApiProperty({
    example: "Alex",
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty({
    example: "Paul",
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: "alexpaul1223@gmail.com",
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "alexDEV123",
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: "Happy4You&",
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: "Happy4You&",
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organizationId: number;



  @ApiProperty({ description: '0 for false and 1 for true' })
  @IsNotEmpty()
  @IsNumber()
  is_term_condition: number

  @ApiProperty({ description: '0 for false and 1 for true' })
  @IsNotEmpty()
  @IsNumber()
  is_private_policies: number


}

export class AuthRegisterLearnerDto {
  @ApiProperty({
    type: "array",
    name: "avator",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  avator: any;

  @ApiProperty({
    example: "Umar",
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty({
    example: "Khan",
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: "umarkhan@gmail.com",
  })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: "umerdev",
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: "Happy4You&",
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: "Happy4You&",
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty()
  @IsString()
  grades: string;


  @ApiProperty({
    example: "2012-12-12T08:00:00.000Z",
  })
  @IsString()
  @IsOptional()
  DOB: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  instrutorId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organizationId: number;


  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  instituteId: number;


  @ApiProperty({ description: '0 for false and 1 for true' })
  @IsNotEmpty()
  @IsNumber()
  is_term_condition: number

  @ApiProperty({ description: '0 for false and 1 for true' })
  @IsNotEmpty()
  @IsNumber()
  is_private_policies: number


}

export class TutorExpierencedto {
  @ApiProperty()
  @IsNumber()
  expeirenceLevelId: number;

  @ApiProperty()
  @IsString()
  grades: string;

  @ApiProperty()
  @IsNumber()
  subjectId: number;
}

export class TutorteachingStyleDto {
  @ApiProperty()
  @IsNumber()
  teaching_style_id: number
}

export class TutorCredentailsDto {
  @ApiProperty()
  @IsString()
  credentails: string;
}



export class AuthRegisterInstructorDto {
  @ApiProperty({
    type: "array",
    name: "avator",
    description: "user can upload his profile picture",
    items: { type: "string", format: "binary" },
  })
  avator: any;

  @ApiProperty({ example: "Ibrar" })
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty({ example: "Gill" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: "ibrargill1998@gmail.com" })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "IbrarDev1998" })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: "Happy4You&" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: "Happy4You&" })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: "12-12-12",
  })
  @IsString()
  @IsOptional()
  DOB: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @IsOptional()
  hourlyRate: number;

  @ApiProperty()
  @IsNumber()
  isTutor: number;

  @ApiProperty({ example: TutorBio })
  @IsString()
  @IsOptional()
  bio: string;


  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  organizationId: number;


  @ApiProperty({ description: '0 for false and 1 for true' })
  @IsNotEmpty()
  @IsNumber()
  is_term_condition: number

  @ApiProperty({ description: '0 for false and 1 for true' })
  @IsNotEmpty()
  @IsNumber()
  is_private_policies: number


  @ApiProperty({ example: TutorExpierence })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @Type(() => TutorExpierencedto)
  userexpirence: TutorExpierencedto[]

  @ApiProperty({ example: TutorTeachingStyle })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => TutorteachingStyleDto)
  teachingStyle: TutorteachingStyleDto[];

  @ApiProperty({ example: TutorCredentails })
  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true, always: true })
  @IsArray()
  @IsOptional()
  @Type(() => TutorCredentailsDto)
  credentails: TutorCredentailsDto[];


}

export class ExpericesDto {
  @ApiProperty()
  @IsString()
  Subject: string;
  @ApiProperty()
  @IsString()
  Grade: string;
  @ApiProperty()
  @IsNumber()
  ExpeirenceLevel: string;
}

export class YearOfExpericesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpericesDto)
  Expeirences: ExpericesDto[];
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  old_password: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}

export class ForgetEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyPassworVerificationCode {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  code: number;
}

export class ForgetPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}


export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  acces_token: string;

}

export class GoogleUser {

  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  accessToken: string;
}

export class ShareableLinkdto {
  @ApiProperty({ example: 24 })
  instructorId: number
  @ApiProperty({ example: '1d' })
  @IsString()
  time: string
  @ApiProperty({ example: 1 })
  sessionId: number
  @ApiProperty({ example: [1, 2] })
  @IsArray()
  learners: Number[]
  @ApiProperty({ example: ['007igill@gmail.com', 'ibrargill1998@gmail.com'] })
  @IsArray()
  leanerEmails: string[]
  @ApiProperty({ example: false })
  isDone: boolean
}


export class LogoutDto {
  @ApiProperty()
  @IsNumber()
  userId: number
  @ApiProperty()
  @IsString()
  access_token: string
}