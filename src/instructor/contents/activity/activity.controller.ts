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
  UsePipes,
  ValidationPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { InstructorImageValidation } from "src/AssetValidation/instructorImageValidation";
import { ActivityService } from "./activity.service";
import {
  ActivityDuplicationDto,
  CreateActivityDto,
  FindActivityByArrayofIds,
  SearchContentActivity,
} from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { Response, Request } from "express";
import { ActivityAnd3Dmodelvalidation } from "src/AssetValidation/activity3Dmodelvalidation";
import { JwtGuard } from "src/authStrategy/guard";
import { CreateActivityJsonDto } from "./dto/create-activity-json";
import { UpdateActivityJsonDto } from "./dto/update-activity-json";

@Controller("")
@ApiTags("/contents/activity")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Post("create")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(ActivityAnd3Dmodelvalidation)
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() dto: CreateActivityDto,
    @Res() response: Response
  ) {
    return this.activityService.createContentActivity(files, dto, response);
  }

  @Post("v2/create")
  @UsePipes(new ValidationPipe())
  createactivitywithjson(
    @Body() dto: CreateActivityJsonDto,
    @Res() response: Response
  ) {
    return this.activityService.createContentActivityWithJson( dto, response);
  }

  @Get("all")
  findAll(@Query() query: SearchContentActivity, @Res() response: Response) {
    return this.activityService.findAll(query, response);
  }

  @Get("filters/:instuctorId")
  getactivityfilters(@Param("instuctorId") instuctorId: number, @Res() response: Response) {
    return this.activityService.getactivityfilters(instuctorId, response);
  }

  @Get("duplicate")
  duplicateActivity(@Query() query: ActivityDuplicationDto, @Res() response: Response) {
    return this.activityService.duplicateActivity(query, response);
  }


  @Get(":id")
  findOne(@Param("id") id: number, @Res() response: Response) {
    return this.activityService.findOne(id, response);
  }

  @Post("getbyids")
  getByArray(
    @Body() dto: FindActivityByArrayofIds,
    @Res() response: Response
  ) {
    return this.activityService.getActivitesbyActivitesIds(
      dto,
      response
    );
  }

  @Patch(":activityId")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(ActivityAnd3Dmodelvalidation)
  update(
    @UploadedFiles() files: Express.Multer.File,
    @Param("activityId") activityId: number,
    @Body() updateActivityDto: UpdateActivityDto,
    @Res() response: Response
  ) {
    return this.activityService.update(activityId, updateActivityDto, response, files);
  }

  @Patch("v2/:activityId")
  updateActivityV2(
    @Param("activityId") activityId: number,
    @Body() updateActivityDto: UpdateActivityJsonDto,
    @Res() response: Response
  ) {
    return this.activityService.updateActivityV2(activityId, updateActivityDto, response);
  }


  @Delete(":id")
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.activityService.removeContentActivity(+id, response);
  }
}
