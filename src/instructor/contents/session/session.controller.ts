import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Res,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { SessionService } from "./session.service";
import {
  CreateSessionDto,
  SearchContentSession,
  SearchSessionsBySkills,
  SessionDuplicationDto,
  ShareableLinkQueryDto,
  UpComingSessionQuery,
  learnerSessionQuery,
} from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";
import { InstructorImageValidation } from "src/AssetValidation/instructorImageValidation";
import { JwtGuard } from "src/authStrategy/guard";
@Controller("")
@ApiTags("/contents/session")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Post("create")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() createSessionDto: CreateSessionDto,
    @Res() response: Response
  ) {
    return this.sessionService.createContentSession(
      files,
      createSessionDto,
      response
    );
  }

  @Get("all")
  findAll(@Query() query: SearchContentSession, @Res() response: Response) {
    return this.sessionService.findAllSession(query, response);
  }

  @Get("filters/:instuctorId")
  getSessionfilters(@Param("instuctorId") instuctorId: number, @Res() response: Response) {
    return this.sessionService.getSessionfilters(instuctorId, response);
  }

  @Get("duplicate")
  duplicateSession(@Query() query: SessionDuplicationDto, @Res() response: Response) {
    return this.sessionService.duplicateSession(query, response);
  }


  @Get("single/:id")
  findOne(@Param("id") id: number, @Query() query: ShareableLinkQueryDto, @Res() response: Response) {
    return this.sessionService.findOneSession(id, query, response);
  }

  @Patch(":sessionId")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  update(
    @UploadedFiles() files: Express.Multer.File,
    @Param("sessionId") sessionId: number,
    @Body() dto: UpdateSessionDto,
    @Res() response: Response
  ) {
    return this.sessionService.updateContentSession(files, sessionId, dto, response);
  }

  @Delete(":id")
  remove(@Param("id") id: number, @Res() response: Response) {
    return this.sessionService.removeSessionFromDB(id, response);
  }

  @Get("/learner")
  findAllLeanerSession(@Query() query: learnerSessionQuery, @Res() response: Response) {
    return this.sessionService.findAllLeanerSession(query, response);
  }

  @Get("/upcomingsession")
  upcomingsession(@Query() query: UpComingSessionQuery, @Res() response: Response) {
    return this.sessionService.upcomingsession(query, response);
  }
  SearchSessionsBySkills
  @Get("/skillidbase")
  sesssionbyskills(@Query() query: SearchSessionsBySkills, @Res() response: Response,@Req() request:Request) {
    return this.sessionService.sesssionBySkills(query, response,request);
  }
}
